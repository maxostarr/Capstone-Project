import React, {useState, useContext, useEffect} from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import PropTypes from 'prop-types';
import {useHistory} from 'react-router';
// import axios from 'axios';

import {loadToken} from './request';
export const EmailContext = React.createContext({});


// https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
const parseJwt = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

  return JSON.parse(jsonPayload);
};


export const useEmail = () => useContext(EmailContext);

const EmailContextProvider = ({children}) => {
  const history = useHistory();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentMailbox, setCurrentMailbox] = useState('inbox');
  const [currentMailboxID, setCurrentMailboxID] = useState('');
  const [mailFilter, setMailFilter] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentEmailID, setCurrentEmailID] = useState(null);
  const [composeAutofill, setComposeAutofill] = useState(null);
  const [user, setUser] = useState(null);
  const [mailboxes, setMailboxes] = useState([]);
  const [email, setEmail] = useState({});
  // const [emailClient, setemailClient] = useState({});

  // let accessToken;
  const loadUser = () => {
    const accessToken = window.localStorage.getItem('accessToken');
    if (!accessToken) {
      return;
    }
    loadToken();
    const claims = parseJwt(accessToken);
    setUser(claims);
    history.push('/');
  };
  useEffect(loadUser, []);

  // const emailClient = ;

  const desktop = useMediaQuery('(min-width:960px)');
  return (
    <EmailContext.Provider value={{
      isDrawerOpen,
      setIsDrawerOpen,
      currentMailbox,
      setCurrentMailbox,
      isComposeOpen,
      setIsComposeOpen,
      currentMailboxID,
      setCurrentMailboxID,
      currentEmailID,
      setCurrentEmailID,
      mailFilter,
      setMailFilter,
      searchMode,
      setSearchMode,
      composeAutofill,
      setComposeAutofill,
      mailboxes,
      setMailboxes,
      // emailClient,
      isSettingsOpen,
      setIsSettingsOpen,
      user,
      setUser,
      loadUser,
      email,
      setEmail,
      desktop,
    }}>
      {children}
    </EmailContext.Provider >
  );
};

EmailContextProvider.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element),
};

export default EmailContextProvider;
