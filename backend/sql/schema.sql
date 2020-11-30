-- Dummy table --
DROP TABLE IF EXISTS dummy;
CREATE TABLE dummy(created TIMESTAMP WITH TIME ZONE);

-- Your database schema goes here --
-- from asg 8 and https://launchschool.com/books/sql_first_edition/read/multi_tables
DROP TABLE IF EXISTS mailboxes;
CREATE TABLE mailboxes(
  id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(32)
);

DROP TABLE IF EXISTS mail;
CREATE TABLE mail(
  id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), 
  mailbox_id UUID,
  mail jsonb,
  FOREIGN KEY (mailbox_id) REFERENCES mailboxes(id) ON DELETE CASCADE
);