const jwt = require('jsonwebtoken');
const {
  getMailboxByID,
  getEmailByID,
  getMailboxSummary,
  setStarredByID,
  getStarred,
  addEmailToSent,
  setUnreadByID,
  addNewMailbox,
  moveEmailByID,
  getKnownContacts,
  updateUserById,
} = require('./queries');
const jwtsecret = 'secret123';

// from https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
// const validateEmail = (email) => {
//   // eslint-disable-next-line max-len
//   const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   return re.test(String(email).toLowerCase());
// };

const getMailboxSummaryRoute = async (req, res) => {
  const summary = await getMailboxSummary(req.user.id);
  // if (!summary) {
  //   res.sendStatus(500);
  // }
  res.contentType('application/json')
      .status(200)
      .json(summary);
};

const getMailboxByIDRoute = async (req, res) => {
  const targetMailboxID = req.params.id;
  let mailbox;
  if (targetMailboxID==='00000000-0000-0000-0000-000000000000') {
    mailbox = await getStarred(req.user.id);
  } else {
    mailbox = await getMailboxByID(targetMailboxID, req.user.id);
  }
  res.contentType('application/json')
      .status(200)
      .json(mailbox||[]);
};

const getEmailByIDRoute = async (req, res) => {
  const targetEmailID = req.params.id;

  const email = await getEmailByID(targetEmailID, req.user.id);
  res.contentType('application/json')
      .status(200)
      .json(email);
};

const setStarredByIDRoute = async (req, res) => {
  const targetEmailID = req.params.id;
  const starred = req.query.starred;
  await setStarredByID(targetEmailID, req.user.id, starred);
  res.sendStatus(204);
};

const setUnreadByIDRoute = async (req, res) => {
  const targetEmailID = req.params.id;
  const unread = req.query.unread;
  await setUnreadByID(targetEmailID, req.user.id, unread);
  res.sendStatus(204);
};

const addEmailToSentRoute = async (req, res) => {
  const email = JSON.stringify(req.body);
  await addEmailToSent(email, req.user.id);
  res.sendStatus(201);
};

const addNewMailboxRoute = async (req, res) => {
  const mailboxName = req.query.name;
  await addNewMailbox(mailboxName, req.user.id);
  res.sendStatus(201);
};

const moveEmailByIDRoute = async (req, res) => {
  const emailID = req.query.email;
  const mailboxID = req.query.mailbox;
  await moveEmailByID(emailID, mailboxID, req.user.id);
  res.sendStatus(201);
};

const getKnownContactsRoute = async (req, res) => {
  const contacts = await getKnownContacts(req.user.id);
  res.contentType('application/json')
      .status(200)
      .json(contacts);
};

const updateUserByIdRoute = async (req, res) => {
  const {username, avatar} = req.body;
  const user = await updateUserById(username, avatar, req.user.id);
  const accessToken = jwt.sign({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar || '',
  }, jwtsecret);
  res.status(201)
      .contentType('application/json')
      .json({accessToken});
  ;
};

module.exports={
  getMailboxSummaryRoute,
  getMailboxByIDRoute,
  getEmailByIDRoute,
  setStarredByIDRoute,
  addEmailToSentRoute,
  setUnreadByIDRoute,
  addNewMailboxRoute,
  moveEmailByIDRoute,
  getKnownContactsRoute,
  updateUserByIdRoute,
};
