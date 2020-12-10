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
    text: `SELECT json_agg(
      ('{"id":"' || test.id || '"}' )::jsonb
    ||
    mail - 'starred' -'unread'- 'received'
    ||
    ('{"received":"' || (test.mail->>'received') || '"}' )::jsonb
    ||
    ('{"starred":' || (mail->>'starred')::boolean || '}' )::jsonb
    ||
    ('{"unread":' || (mail->>'unread')::boolean || '}' )::jsonb)
    FROM (
          SELECT C.*
          FROM mailboxes P
          INNER JOIN mail C
          ON C . mailbox_id = P . id
        INNER JOIN users U
          ON P . p_user_id = U . id
          WHERE P . id = $1 AND
                U.id= $2
          ORDER BY
          C . mail ->> 'received' DESC
             ) AS test

    `,
    values: [mailboxID, userID],
  };

  const {rows}=await pool.query(query);
  return rows[0]['json_agg'];
};

const getStarred = async (userID) => {
  // help from https://stackoverflow.com/questions/37288824/sql-aggregate-query-with-one-to-many-relationship-with-postgres
  // and https://www.postgresqltutorial.com/postgresql-count-function/
  const query = {
    text: `SELECT json_agg(
      ('{"id":"' || id || '"}' )::jsonb
    ||
    mail - 'starred' - 'unread' - 'received'
    ||
    ('{"received":"' || (mail->>'received') || '"}' )::jsonb
    ||
    ('{"starred":' || (mail->>'starred')::boolean || '}' )::jsonb
    ||
    ('{"unread":' || (mail->>'unread')::boolean || '}' )::jsonb)
    FROM (
         SELECT M.*
        FROM mail M
        INNER JOIN mailboxes m2 on m2.id = M.mailbox_id
        INNER JOIN users u on u.id = m2.p_user_id
        WHERE p_user_id= $1
        ORDER BY
          M.mail ->> 'received' DESC
             ) AS test WHERE mail->>'starred' = 'true'
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
    text: `SELECT
    (COUNT(C.id) FILTER (WHERE C.mail->>'unread'='true'))::int AS size
 ,P.title AS name
 ,P.id AS id
 FROM        mailboxes P
 LEFT JOIN  mail  C
     ON      C.mailbox_id = P.id
 INNER JOIN users u on u.id = P.p_user_id
 WHERE u.id= $1
 GROUP BY
     P.title,
     P.id
UNION
SELECT (COUNT(id))::int AS starred,
'starred','00000000-0000-0000-0000-000000000000'
FROM (
      SELECT M.*
     FROM mail M
     INNER JOIN mailboxes m2 on m2.id = M.mailbox_id
     INNER JOIN users u on u.id = m2.p_user_id
     WHERE p_user_id= $1
          ) AS test WHERE mail->>'starred' = 'true'
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
    text: `SELECT
    json_agg(
      ('{"id":"' || test.id || '"}' )::jsonb
    ||
      ('{"mailbox":"' || test.mailbox || '"}' )::jsonb
    ||
    mail - 'starred' - 'unread' - 'received'
    ||
    ('{"received":"' || (test.mail->>'received') || '"}' )::jsonb
    ||
    ('{"starred":' || (mail->>'starred')::boolean || '}' )::jsonb
    ||
    ('{"unread":' || (mail->>'unread')::boolean || '}' )::jsonb)
    FROM (
          SELECT C.*, P.title AS mailbox
          FROM mailboxes P
          INNER JOIN mail C
          ON C . mailbox_id = P . id
          INNER JOIN users u on u.id = P.p_user_id
          WHERE C.id = $1 AND p_user_id= $2
          ORDER BY
          C . mail ->> 'received' DESC
             ) AS test`,
    values: [emailID, userID],
  };

  const {rows}=await pool.query(query);
  return rows[0]['json_agg'][0];
};

const setStarredByID = async (emailID, userID, starredVal) => {
  // structure from https://www.enterprisedb.com/blog/crud-json-postgresql
  const query = {
    text: `UPDATE mail SET mail = jsonb_set(
      mail,
      '{starred}',
      to_jsonb($3::TEXT)
      )
FROM mailboxes, users
WHERE mailbox_id=mailboxes.id AND
      mailboxes.p_user_id= $2 AND
      mail.id= $1`,
    values: [emailID, userID, starredVal],
  };

  const {rows}=await pool.query(query);
  return rows;
};

const setUnreadByID = async (emailID, userID, unreadVal) => {
  // structure from https://www.enterprisedb.com/blog/crud-json-postgresql
  const query = {
    text: `UPDATE mail SET mail = jsonb_set(
      mail,
      '{unread}',
      to_jsonb($3::TEXT)
      )
FROM mailboxes, users
WHERE mailbox_id=mailboxes.id AND
      mailboxes.p_user_id= $2 AND
      mail.id= $1`,
    values: [emailID, userID, unreadVal],
  };

  const {rows}=await pool.query(query);
  return rows;
};

const moveEmailByID = async (emailID, mailboxID, userID) => {
  const query = {
    text: `WITH targetMailbox AS (
      SELECT M.id AS mailboxId FROM
      mailboxes M
      INNER JOIN users u on u.id = M.p_user_id
      WHERE M.id = $2
      AND   U.id = $3
  )
  UPDATE mail SET mailbox_id = (SELECT mailboxId FROM targetMailbox)
  FROM mailboxes, users
  WHERE mail.id = $1
      AND mailbox_id=mailboxes.id
      AND mailboxes.p_user_id = $3
  `,
    values: [emailID, mailboxID, userID],
  };

  const {rows}=await pool.query(query);
  return rows;
};

const addEmailToSent = async (email, userID) => {
  const query = {
    text: `WITH sentID AS (
      SELECT M.id FROM
        mailboxes M
      INNER JOIN users u on u.id = M.p_user_id

      WHERE title='sent' AND u.id= $2
  )
  INSERT INTO mail(mailbox_id, mail) SELECT
  (SELECT id FROM sentID ),
  (
      ('{"from":' || (
          SELECT (
        ('{"email":"' || (email) || '"}')::jsonb ||
        ('{"avatar":"' || (avatar) || '"}')::jsonb ||
        ('{"name":"' || (username) || '"}')::jsonb
                 ) FROM users WHERE id= $2
          )::TEXT || '}')::jsonb
      ||
      $1
      ||
      ('{"sent":' || to_json(now())::TEXT || '}')::jsonb
      ||
      ('{"starred":"false"}')::jsonb
      ||
      ('{"unread":"false"}')::jsonb
      ||
      ('{"received":' || to_json(now())::TEXT || '}')::jsonb)
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

const getKnownContacts = async (userID) => {
  console.log(userID);
  const query = {
    text: `SELECT json_agg(DISTINCT mail->'from'->>'email') FROM mail
    INNER JOIN mailboxes m on m.id = mail.mailbox_id
    INNER JOIN users u on u.id = m.p_user_id
    WHERE p_user_id=$1`,
    values: [userID],
  };
  const {rows}=await pool.query(query);
  return rows[0]['json_agg'];
};

const getUserByEmail = async (email) => {
  const query = {
    text: `SELECT id, email, username, avatar,
    u_password AS password FROM users WHERE email=$1 LIMIT 1`,
    values: [email],
  };

  const {rows} = await pool.query(query);
  return rows[0];
};

const updateUserById = async (username, avatar, userID) => {
  const query = {
    text: `UPDATE users SET username = $1, avatar = $2
    WHERE id=$3 RETURNING *`,
    values: [username, avatar, userID],
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

