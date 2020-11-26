import React from 'react';
import {CssBaseline} from '@material-ui/core';
import './index.css';
import EmailContextProvider from './context';
// import Login from './Login';
import Home from './Home';

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
      {/* <Login /> */}
      <Home/>

    </EmailContextProvider>
  );
}

export default App;
