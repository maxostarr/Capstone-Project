const {
  getMailboxByID,
  getEmailByID,
  getMailboxSummary,
} = require('./queries');

// from https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
// const validateEmail = (email) => {
//   // eslint-disable-next-line max-len
//   const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   return re.test(String(email).toLowerCase());
// };

const getMailboxSummaryRoute = async (req, res) => {
  const summary = await getMailboxSummary();
  // if (!summary) {
  //   res.sendStatus(500);
  // }
  console.log(summary);
  res.contentType('application/json')
      .status(200)
      .json(summary);
};

const getMailboxByIDRoute = async (req, res) => {
  const targetMailboxID = req.params.id;
  const mailbox = await getMailboxByID(targetMailboxID);
  res.contentType('application/json')
      .status(200)
      .json(mailbox);
};

const getEmailByIDRoute = async (req, res) => {
  const targetEmailID = req.params.id;
  const email = await getEmailByID(targetEmailID);
  console.log(email);
  res.contentType('application/json')
      .status(200)
      .json(email);
};

module.exports={
  getMailboxSummaryRoute,
  getMailboxByIDRoute,
  getEmailByIDRoute,
};
