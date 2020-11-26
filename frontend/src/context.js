import React, {useState} from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import PropTypes from 'prop-types';

export const EmailContext = React.createContext({});


const EmailContextProvider = ({children}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentMailbox, setCurrentMailbox] = useState('inbox');
  const desktop = useMediaQuery('(min-width:960px)');
  return (
    <EmailContext.Provider value={{isDrawerOpen,
      setIsDrawerOpen,
      currentMailbox,
      setCurrentMailbox,
      desktop}}>
      {children}
    </EmailContext.Provider >
  );
};

EmailContextProvider.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element),
};

export default EmailContextProvider;
