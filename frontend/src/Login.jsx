import {
  Typography,
  Container,
  TextField,
  Checkbox,
  Button,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import React, {useContext, useState} from 'react';
import axios from 'axios';
import {EmailContext} from './context';
const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    // flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signToggle: {
    position: 'absolute',
    top: 10,
    right: 10,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  loginBox: {
    display: 'flex',
    flexDirection: 'column',
    // height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 'max-content',
  },
  input: {
    marginTop: theme.spacing(3),
  },
  bottom: {
    marginTop: theme.spacing(3),
    display: 'flex',
  },
}));


const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const {loadUser} = useContext(EmailContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSign = async () => {
    const creds = {email, password};
    const res = await axios.post(`http://localhost:3010/v0/auth/${isLogin ? 'login' : 'signup'}`, creds);
    window.localStorage.setItem('accessToken',
        res.data.accessToken);
    loadUser();
  };
  const classes = useStyles();
  return (
    <Container className={classes.container}>
      <Typography className={classes.signToggle}
        onClick={() => setIsLogin(!isLogin)}>
        {!isLogin ? 'Login' : 'Sign Up'}
      </Typography>
      <Container className={classes.loginBox}>
        <Typography variant="h2">{isLogin ? 'Login' : 'Sign Up'}</Typography>

        <TextField className={classes.input}
          id="outlined-basic" label="Email"
          type="email"
          inputProps={{
            type: 'email',
          }}
          value={email} onChange={(e) => setEmail(e.target.value)}
          variant="outlined" />
        <TextField className={classes.input}
          id="outlined-basic" label="Password"
          type="password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          variant="outlined" />
        <Container className={classes.bottom}>
          <Container>

            <Checkbox
              color="primary"
              checked={true}
              // onChange={handleChange}
              inputProps={{'aria-label': 'primary checkbox'}}
            />
            <Typography variant="caption" >Remember me</Typography>
          </Container>
          <Button
            onClick={handleSign}
            variant="contained" color="primary">
            {isLogin ? 'Login' : 'Sign\u00a0Up'}
          </Button>
        </Container>
      </Container>
    </Container>
  );
};

export default Login;
