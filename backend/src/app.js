const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');

const dummy = require('./dummy');
const emails = require('./email');
const auth = require('./login');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const apiSpec = path.join(__dirname, '../api/openapi.yaml');

const apidoc = yaml.safeLoad(fs.readFileSync(apiSpec, 'utf8'));
app.use('/v0/api-docs', swaggerUi.serve, swaggerUi.setup(apidoc));

app.use(
    OpenApiValidator.middleware({
      apiSpec: apiSpec,
      validateRequests: true,
      validateResponses: true,
    }),
);

app.get('/v0/dummy', dummy.get);
app.get('/v0/', async (req, res) => res.sendStatus(200));
// Your routes go here
app.post('/v0/auth/login', auth.loginRoute);
app.post('/v0/auth/signup', auth.signUpRoute);

app.get('/v0/mailbox/summary', auth.verifyUser, emails.getMailboxSummaryRoute);
app.get('/v0/mailbox/by/:id', auth.verifyUser, emails.getMailboxByIDRoute);
app.get('/v0/mail/:id', auth.verifyUser, emails.getEmailByIDRoute);
app.get('/v0/mail/star/:id', auth.verifyUser, emails.setStarredByIDRoute);

app.get('/v0/user/contacts', auth.verifyUser, emails.getKnownContactsRoute);

app.put('/v0/mail/unread/:id', auth.verifyUser, emails.setUnreadByIDRoute);
app.post('/v0/mail', auth.verifyUser, emails.addEmailToSentRoute);
app.post('/v0/mailbox', auth.verifyUser, emails.addNewMailboxRoute);
app.post('/v0/mail/move', auth.verifyUser, emails.moveEmailByIDRoute);
app.post('/v0/user/update', auth.verifyUser, emails.updateUserByIdRoute);

app.use((err, req, res, next) => {
  if (err) {
    res.status(err.status).json({
      message: err.message,
      errors: err.errors,
      status: err.status,
    });
  }
});

module.exports = app;
