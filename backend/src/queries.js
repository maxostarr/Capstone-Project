const {Pool} = require('pg');
require('dotenv').config();


const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});


const getMailboxByID = async (mailboxID, userID) => {
  // help from https://stackoverflow.com/questions/37288824/sql-aggregate-query-with-one-to-many-relationship-with-postgres
  // and https://stackoverflow.com/questions/13615760/add-element-to-json-object-in-postgres
  // and https://www.reddit.com/r/PostgreSQL/comments/ftfxhs/query_results_as_json_without_column_name/
  const query = {
    text: `SELECT
    json_agg(
        (('{"id":"' || id || '"}')::jsonb
    ||
mail  - 'received'
    ||
('{"mailbox":"' || mailbox || '"}')::jsonb
    ||
('{"received":"' || (mail ->> 'received') || '"}')::jsonb
    ||
('{"starred":' || (SELECT COALESCE((
    SELECT 'true'
    FROM stars
    WHERE mail_id = id
      AND p_user_id = $2
),'false'    ))::boolean || '}')::jsonb
    ||
('{"from":' || (SELECT (
    ('{"name":"' || username::text || '"}')::jsonb ||
    ('{"id":"' || id::text || '"}')::jsonb ||
    ('{"email":"' || email::text || '"}')::jsonb ||
    ('{"avatar":"' || avatar::text || '"}')::jsonb ||
    ('{"showAvatar":' || show_avatar::boolean || '}')::jsonb
                           )
                FROM users
                WHERE users.id = from_user_id
)::text || '}')::jsonb
    ||
('{"to":' || (SELECT (
    ('{"name":"' || username::text || '"}')::jsonb ||
    ('{"id":"' || id::text || '"}')::jsonb ||
    ('{"email":"' || email::text || '"}')::jsonb ||
    ('{"avatar":"' || avatar::text || '"}')::jsonb ||
    ('{"showAvatar":' || show_avatar::boolean || '}')::jsonb
                         )
              FROM users
              WHERE users.id = to_user_id
)::text || '}')::jsonb
        ||
('{"unread":' || (SELECT COALESCE((
    SELECT 'true'
    FROM unread
    WHERE mail_id = id
      AND p_user_id = $2
),'false'    ))::boolean || '}')::jsonb
    )
        )
FROM (
SELECT C.*, p.title AS mailbox
FROM mailboxes P
INNER JOIN mailtomailbox m on P.id = m.mailbox_id
INNER JOIN mail C
      ON C.id = m.mail_id
INNER JOIN users O
      ON P.p_user_id = O.id
WHERE P.id = $1
AND O.id = $2

ORDER BY C.mail ->> 'received' DESC
) AS test
    `,
    values: [mailboxID, userID],
  };

  const {rows}=await pool.query(query);
  return rows[0]['json_agg'];
};

const getStarred = async (userID) => {
  // help from https://stackoverflow.com/questions/37288824/sql-aggregate-query-with-one-to-many-relationship-with-postgres
  const query = {
    text: `SELECT json_agg(('{"id":"' || id || '"}')::jsonb
    ||
mail - 'starred' - 'unread' - 'received'
    ||
('{"mailbox":"' || mailbox || '"}')::jsonb
    ||
('{"received":"' || (mail ->> 'received') || '"}')::jsonb
    ||
('{"starred":' || (SELECT COALESCE((
          SELECT 'true'
          FROM stars
          WHERE mail_id = id
            AND p_user_id = $1
      ), 'false'))::boolean || '}')::jsonb
    ||
('{"from":' || (SELECT (
('{"name":"' || username::text || '"}')::jsonb ||
('{"id":"' || id::text || '"}')::jsonb ||
('{"email":"' || email::text || '"}')::jsonb ||
('{"avatar":"' || avatar::text || '"}')::jsonb ||
('{"showAvatar":' || show_avatar::boolean || '}')::jsonb
                           )
                FROM users
                WHERE users.id = from_user_id
)::text || '}')::jsonb
    ||
('{"to":' || (SELECT (
        ('{"name":"' || username::text || '"}')::jsonb ||
        ('{"id":"' || id::text || '"}')::jsonb ||
        ('{"email":"' || email::text || '"}')::jsonb ||
        ('{"avatar":"' || avatar::text || '"}')::jsonb ||
        ('{"showAvatar":' || show_avatar::boolean || '}')::jsonb
                         )
              FROM users
              WHERE users.id = to_user_id
)::text || '}')::jsonb
||
('{"unread":' || (SELECT COALESCE((
        SELECT 'true'
        FROM unread
        WHERE mail_id = id
          AND p_user_id = $1
    ), 'false'))::boolean || '}')::jsonb
)
FROM (
SELECT C.*, m2.title AS mailbox
FROM mail C
  INNER JOIN mailtomailbox m on C.id = m.mail_id
    INNER JOIN mailboxes m2 on m2.id = m.mailbox_id
INNER JOIN stars s on C.id = s.mail_id AND m2.p_user_id = s.p_user_id
WHERE m2.p_user_id = $1
ORDER BY C.mail ->> 'received' DESC
) AS test

    `,
    values: [userID],
  };

  const {rows} = await pool.query(query);
  return rows[0]['json_agg'];
};

const getMailboxSummary = async (userID) => {
  // help from https://stackoverflow.com/questions/37288824/sql-aggregate-query-with-one-to-many-relationship-with-postgres
  // and https://www.postgresqltutorial.com/postgresql-count-function/
  const query = {
    text: `SELECT (COUNT(C.id) FILTER ( WHERE
      C.id = u3.mail_id
      ))::int    AS size
       , P.title AS name
       , P.id    AS id
  FROM mailboxes P
           LEFT JOIN mailtomailbox m on P.id = m.mailbox_id
           INNER JOIN users u on u.id = P.p_user_id
           LEFT JOIN unread u3 on m.mail_id = u3.mail_id
           LEFT JOIN mail C
                     ON C.id = M.mail_id
  WHERE u.id = $1
  GROUP BY P.title,
           P.id
  UNION
  SELECT (COUNT(id))::int AS starred,
         'starred',
         '00000000-0000-0000-0000-000000000000'
  FROM (
           SELECT M.*
           FROM mail M
            INNER JOIN mailtomailbox m2 on M.id = m2.mail_id
            INNER JOIN mailboxes m3 on m3.id = m2.mailbox_id
            INNER JOIN users u2 on u2.id = m3.p_user_id
            INNER JOIN stars s on M.id = s.mail_id AND u2.id = s.p_user_id
           WHERE m3.p_user_id = $1
       ) AS test
    `,
    values: [userID],
  };

  const {rows} = await pool.query(query);
  return rows;
};

const getEmailByID = async (emailID, userID) => {
  // and https://stackoverflow.com/questions/13615760/add-element-to-json-object-in-postgres
  // and https://www.reddit.com/r/PostgreSQL/comments/ftfxhs/query_results_as_json_without_column_name/
  const query = {
    text: `SELECT (('{"id":"' || id || '"}')::jsonb
    ||
mail - 'starred' - 'unread' - 'received'
    ||
('{"mailbox":"' || mailbox || '"}')::jsonb
    ||
('{"received":"' || (mail ->> 'received') || '"}')::jsonb
    ||
('{"starred":' || (SELECT COALESCE((
    SELECT 'true'
    FROM stars
    WHERE mail_id = $1
      AND p_user_id = $2
),'false'    ))::boolean || '}')::jsonb
    ||
('{"from":' || (SELECT (
    ('{"name":"' || username::text || '"}')::jsonb ||
    ('{"id":"' || id::text || '"}')::jsonb ||
    ('{"email":"' || email::text || '"}')::jsonb ||
    ('{"avatar":"' || avatar::text || '"}')::jsonb ||
    ('{"showAvatar":' || show_avatar::boolean || '}')::jsonb
                           )
                FROM users
                WHERE users.id = from_user_id
)::text || '}')::jsonb
    ||
('{"to":' || (SELECT (
    ('{"name":"' || username::text || '"}')::jsonb ||
    ('{"id":"' || id::text || '"}')::jsonb ||
    ('{"email":"' || email::text || '"}')::jsonb ||
    ('{"avatar":"' || avatar::text || '"}')::jsonb ||
    ('{"showAvatar":' || show_avatar::boolean || '}')::jsonb
                         )
              FROM users
              WHERE users.id = to_user_id
)::text || '}')::jsonb
        ||
('{"unread":' || (SELECT COALESCE((
    SELECT 'true'
    FROM unread
    WHERE mail_id = $1
      AND p_user_id = $2
),'false'    ))::boolean || '}')::jsonb
    ) AS email
FROM (
 SELECT C.*, m2.title AS mailbox
 FROM mail C
          INNER JOIN mailtomailbox m on C.id = m.mail_id
          INNER JOIN mailboxes m2 on m2.id = m.mailbox_id
          INNER JOIN users u on u.id = m2.p_user_id
 WHERE C.id = $1
   AND u.id = $2
) AS test`,
    values: [emailID, userID],
  };

  const {rows}=await pool.query(query);
  return rows[0].email;
};

const setStarredByID = async (emailID, userID, starredVal) => {
  const insertQuery = {
    text: `INSERT INTO stars(p_user_id, mail_id) SELECT
    u.id,mail.id
    FROM mail
    INNER JOIN mailtomailbox m on mail.id = m.mail_id
    INNER JOIN mailboxes m2 on m2.id = m.mailbox_id
    INNER JOIN users u on u.id = m2.p_user_id
    WHERE
        p_user_id = $2 AND
          mail.id= $1`,
    values: [emailID, userID],
  };
  const removeQuery = {
    text: `DELETE FROM stars
    WHERE
        p_user_id = $2 AND
        mail_id= $1
    `,
    values: [emailID, userID],
  };

  const {rows}=await pool.query(starredVal==='true'?insertQuery:removeQuery);
  return rows;
};

const setUnreadByID = async (emailID, userID, unreadVal) => {
  const insertQuery = {
    text: `INSERT INTO unread(p_user_id, mail_id) SELECT
    u.id,mail.id
    FROM mail
    INNER JOIN mailtomailbox m on mail.id = m.mail_id
    INNER JOIN mailboxes m2 on m2.id = m.mailbox_id
    INNER JOIN users u on u.id = m2.p_user_id
    WHERE
        p_user_id = $2 AND
          mail.id= $1`,
    values: [emailID, userID],
  };
  const removeQuery = {
    text: `DELETE FROM unread
    WHERE
        p_user_id = $2 AND
        mail_id= $1
    `,
    values: [emailID, userID],
  };
  const {rows}=await pool.query(unreadVal==='true'?insertQuery:removeQuery);
  return rows;
};

const moveEmailByID = async (emailID, mailboxID, userID) => {
  const query = {
    text: `WITH targetEmail AS (
      SELECT mail.id
      FROM mail
               INNER JOIN mailtomailbox m3 on mail.id = m3.mail_id
               INNER JOIN mailboxes m4 on m4.id = m3.mailbox_id
      WHERE mail.id = $1
        AND p_user_id = $3
  ),
       prevMailbox AS (
           SELECT mailbox_id
           FROM mailtomailbox
              INNER JOIN mailboxes m on m.id = mailtomailbox.mailbox_id
           WHERE mail_id = $1
             AND p_user_id = $3
       ),
       targetMailbox AS (
           SELECT id
           FROM mailboxes
           WHERE id = $2
             AND p_user_id = $3
       )
  UPDATE mailtomailbox
  SET mailbox_id = (SELECT id FROM targetMailbox)
  WHERE mail_id = (SELECT id FROM targetEmail)
      AND mailbox_id=(SELECT mailbox_id FROM prevMailbox)
  
  `,
    values: [emailID, mailboxID, userID],
  };

  const {rows}=await pool.query(query);
  return rows;
};

const addEmailToSent = async (email, userID) => {
  const query = {
    text: `WITH sentID AS (
      SELECT M.id AS sentID
      FROM mailboxes M
               INNER JOIN users u on u.id = M.p_user_id
      WHERE title = 'sent'
        AND u.id = $2
  ),
       inboxID AS (
           SELECT mailboxes.id as inboxID
           FROM mailboxes
                    INNER JOIN users u2 on u2.id = mailboxes.p_user_id
           WHERE email = $1::jsonb -> 'to' ->> 'email'
             AND title = 'inbox'
       ),
       newEmail AS (
           INSERT INTO mail (from_user_id, to_user_id, mail) SELECT
                    $2,
    (
        SELECT id
        FROM users
        WHERE email = $1::jsonb -> 'to' ->> 'email'
    )
     ,
    (
                $1::jsonb - 'to'
                ||
                ('{"sent":' || to_json(now())::TEXT || '}')::jsonb
            ||
                ('{"received":' || to_json(now())::TEXT || '}')::jsonb)
               RETURNING id
       ),
       updateRelation AS (
           INSERT INTO mailToMailbox (mail_id, mailbox_id)
               SELECT id, inboxID
               FROM newEmail,
                    inboxID
       ),
     updateRelationB AS (
         INSERT INTO mailToMailbox (mail_id, mailbox_id)
                 SELECT id, sentID
                 FROM newEmail,
                      sentID
     )
INSERT INTO unread(p_user_id, mail_id) SELECT (
        SELECT id
        FROM users
        WHERE email = $1::jsonb -> 'to' ->> 'email'
    ), (
        SELECT id FROM newEmail
    )
   `,
    values: [email, userID],
  };
  await pool.query(query);
};

const addUser = async ({username, email, hash}) => {
  const query = {
    text: `INSERT INTO users(username, email, u_password) VALUES $1,$2,$3`,
    values: [username, email, hash],
  };

  await pool.query(query);
};

const addNewMailbox = async (name, userID) => {
  const query = {
    text: `INSERT INTO mailboxes(title, p_user_id) VALUES ($1,$2)`,
    values: [name, userID],
  };
  await pool.query(query);
};

const getKnownContacts = async () => {
  const query = {
    text: `SELECT json_agg(email) FROM users`,
    values: [],
  };
  const {rows}=await pool.query(query);
  return rows[0]['json_agg'];
};

const getUserByEmail = async (email) => {
  const query = {
    text: `SELECT id, email, username, avatar, show_avatar AS showAvatar,
    u_password AS password FROM users WHERE email=$1 LIMIT 1`,
    values: [email],
  };

  const {rows} = await pool.query(query);
  return rows[0];
};

const updateUserById = async (username, avatar, showAvatar, userID) => {
  const query = {
    text: `UPDATE users SET username = $1, avatar = $2, show_avatar = $3
    WHERE id=$4 RETURNING *`,
    values: [username, avatar, showAvatar, userID],
  };
  const {rows} = await pool.query(query);
  return rows[0];
};

module.exports = {
  getMailboxByID,
  getMailboxSummary,
  getEmailByID,
  setStarredByID,
  getStarred,
  addEmailToSent,
  addUser,
  getUserByEmail,
  setUnreadByID,
  addNewMailbox,
  moveEmailByID,
  getKnownContacts,
  updateUserById,
};

