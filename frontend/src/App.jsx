import React from 'react';
import {CssBaseline} from '@material-ui/core';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import './index.css';
import EmailContextProvider, {useEmail} from './context';
import Login from './Login';
import Home from './Home';
// import Settings from './components/Settings';

/**
 * Simple component with no state.
 *
 * @param {function} setDummy set the dummy state
 */
// function getDummy(setDummy) {
//   fetch('http://localhost:3010/v0/dummy')
//       .then((response) => {
//         if (!response.ok) {
//           throw response;
//         }
//         return response.json();
//       })
//       .then((json) => {
//         setDummy(json.message);
//       })
//       .catch((error) => {
//         setDummy(error.toString());
//       });
// }

/**
 * Simple component with no state.
 *
 * @return {object} JSX
 */
function App() {
  // const [dummy, setDummy] = React.useState('');
  return (
    <Router>

      <EmailContextProvider style={{height: '100%'}}>
        <CssBaseline />
        {/* <h3 id='instruction'>
        Click button to connect to the Backend dummy endpoint</h3>
        <button
        onClick={(event) => {
          getDummy(setDummy);
        }}
        >
        Get Dummy
        </button>
        <p/>
      <label>{dummy}</label> */}
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          {/* <PrivateRoute path="/settings">
            <Settings/>
          </PrivateRoute> */}
          <PrivateRoute path="/">
            <Home/>
          </PrivateRoute>
        </Switch>
      </EmailContextProvider>
    </Router>
  );
}

// from https://reactrouter.com/web/example/auth-workflow
const PrivateRoute = ({children, ...rest}) => {
  const emailContext = useEmail();
  return (
    <Route
      {...rest}
      render={({location}) =>
        emailContext.user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: {from: location},
            }}
          />
        )
      }
    />
  );
};

PrivateRoute.propTypes = {
  children: PropTypes.node,
};

export default App;
