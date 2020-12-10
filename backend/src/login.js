const jwt = require('jsonwebtoken');
// help from https://www.npmjs.com/package/bcrypt
const bcrypt = require('bcrypt');
const {addUser, getUserByEmail} = require('./queries');

const saltRounds = 10;
const jwtsecret = 'secret123';

const signUpRoute = async (req, res) => {
  const {email, password} = req.body;
  const hash = await bcrypt.hash(password, saltRounds);
  await addUser({email, hash});
  const accessToken = jwt.sign({
    email,
    avatar: '',
  }, jwtsecret);
  res.status(201)
      .contentType('application/json')
      .json({accessToken});
};

const loginRoute = async (req, res) => {
  const {email, password} = req.body;
  const user = await getUserByEmail(email);
  if (!user) {
    res.sendStatus(403);
    return;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (valid) {
    const accessToken = jwt.sign({
      id: user.id,
      username: user.username,
      email,
      avatar: user.avatar || '',
    }, jwtsecret);
    res.status(200)
        .contentType('application/json')
        .json({accessToken});
  }
};
// https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
const verifyUser = async (req, res, next) => {
  // gets the token from the authorization header of the incoming request
  const authHeader = req.headers.authorization;
  // checks that a token was given, otherwise send 401: Unauthorized
  if (authHeader) {
    // extract the token from the header. It's in the format "Bearer token"
    const token = authHeader.split(' ')[1];
    // use the verify function from jwt lib to check with saved secret
    jwt.verify(token, jwtsecret, (err, user) => {
      // return 403: Forbidden if the verification fails
      if (err) {
        return res.sendStatus(403);
      }
      // attach the extracted user info to the request and pass it off
      // to the next handler
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = {
  verifyUser,
  signUpRoute,
  loginRoute,
};
