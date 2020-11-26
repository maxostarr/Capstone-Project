import {Typography,
  Container,
  TextField,
  Checkbox,
  Button} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme)=>({
  container: {
    display: 'flex',
    // flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
  const classes = useStyles();
  return (
    <Container className={classes.container}>
      <Container className={classes.loginBox}>
        <Typography variant="h1">Login</Typography>

        <TextField className={classes.input}
          id="outlined-basic" label="Username"
          type="username" variant="outlined" />
        <TextField className={classes.input}
          id="outlined-basic" label="Password"
          type="password" variant="outlined" />
        <Container className={classes.bottom}>
          <Container>

            <Checkbox
              color="primary"
              checked={true}
              // onChange={handleChange}
              inputProps={{'aria-label': 'primary checkbox'}}
            />
            <Typography variant="p">Remember me</Typography>
          </Container>
          <Button variant="contained" color="primary">Sign{'\u00a0'}In</Button>
        </Container>
      </Container>
    </Container>
  );
};

export default Login;
