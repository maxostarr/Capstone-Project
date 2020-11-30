const {Pool} = require('pg');

require('dotenv').config();


const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

const getMailboxByID = async (mailboxID) => {
  // help from https://stackoverflow.com/questions/37288824/sql-aggregate-query-with-one-to-many-relationship-with-postgres
  // and https://stackoverflow.com/questions/13615760/add-element-to-json-object-in-postgres
  // and https://www.reddit.com/r/PostgreSQL/comments/ftfxhs/query_results_as_json_without_column_name/
  const query = {
    text: `SELECT  json_agg(('{"id":"' || C.id || '"}' )::jsonb 
    || mail - 'content' - 'starred' || 
    ('{"starred":' || (mail->>'starred')::boolean || '}' )::jsonb)
          FROM        mailboxes P
          INNER JOIN  mail  C
              ON      C.mailbox_id = P.id
          WHERE P.id = $1
    `,
    values: [mailboxID],
  };

  const {rows}=await pool.query(query);
  return rows[0]['json_agg'];
};

const getMailboxSummary = async () => {
  // help from https://stackoverflow.com/questions/37288824/sql-aggregate-query-with-one-to-many-relationship-with-postgres
  // and https://www.postgresqltutorial.com/postgresql-count-function/
  const query = {
    text: `SELECT  COUNT(*)::int AS size
    ,P.title AS name
    ,P.id AS id
    FROM        mailboxes P
    INNER JOIN  mail  C
        ON      C.mailbox_id = P.id
    GROUP BY
        P.title,
        P.id
    `,
    values: [],
  };

  const {rows} = await pool.query(query);
  return rows;
};

const getEmailByID = async (ID) => {
  // and https://stackoverflow.com/questions/13615760/add-element-to-json-object-in-postgres
  // and https://www.reddit.com/r/PostgreSQL/comments/ftfxhs/query_results_as_json_without_column_name/
  const query = {
    text: `SELECT json_agg(('{"id":"' || id || '"}' )::jsonb 
    || mail - 'content' - 'starred' || 
    ('{"starred":' || (mail->>'starred')::boolean || '}' )::jsonb)
     FROM mail WHERE id = $1`,
    values: [ID],
  };

  const {rows}=await pool.query(query);
  return rows[0]['json_agg'];
};


module.exports = {
  getMailboxByID,
  getMailboxSummary,
  getEmailByID,
};
