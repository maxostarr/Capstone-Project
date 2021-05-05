import {
  Typography,
  Divider,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import React, {useContext, useEffect} from 'react';
import MenuDrawer from './components/MenuDrawer';
import TopBar from './components/TopBar';
import Compose from './components/Compose';
import {EmailContext} from './context';
import Emails from './components/Emails';
import Viewer from './components/Viewer';
import Settings from './components/Settings';

const useStyles = makeStyles((theme) => ({
  content: {
    marginLeft: theme.spacing(31),
    width: `calc(100vw - ${theme.spacing(31)})`,
    display: 'flex',
  },
  emails: {
    // width: `calc(100% - ${theme.spacing(7)}px)`,
    width: '50%',
    overflow: 'scroll',
    height: `calc(100vh - ${theme.spacing(7)}px)`,
    minWidth: '20em',
  },
  emailsMobile: {
    // width: `calc(100% - ${theme.spacing(75)}px)`,
    overflow: 'scroll',
    height: `calc(100vh - ${theme.spacing(7)}px)`,
  },
  viewer: {
    width: '50%',
    // width: `calc(100% - ${theme.spacing(105)}px)`,
    overflow: 'scroll',
    height: `calc(100vh - ${theme.spacing(7)}px)`,
  },
  compose: {
    position: 'fixed',
    zIndex: theme.zIndex.modal-1,
    top: `calc(50vh - ${theme.spacing(100)/2}px)`,
    left: `calc(50vw - ${theme.spacing(100)/2}px)`,
    width: theme.spacing(100),
    height: theme.spacing(100),
  },
}));

const Home = () => {
  const classes = useStyles();
  const {
    isComposeOpen,
    isSettingsOpen,
    currentEmailID,
    user,
    desktop,
    setCurrentMailbox,
    // emailClient,
    currentMailbox} = useContext(EmailContext);
  useEffect(()=>setCurrentMailbox('inbox'), []);
  return (
    <div>
      {
        !user ? (
          <p>Loading</p>
        ) :
          (
            desktop ?
            (
              <>
                {isComposeOpen &&
                  <div className={classes.compose}>
                    <Compose />
                  </div>
                }

                {isSettingsOpen &&
                    <div className={classes.compose}>
                      <Settings />
                    </div>
                }
                <>
                  <TopBar />
                  <MenuDrawer />
                  <div className={classes.content}>
                    <div className={classes.emails}>
                      {/*
                      <Typography variant="h5" style={{
                        marginTop: 10,
                        marginLeft: '2em',
                        textTransform: 'capitalize',
                      }}>
                        {currentMailbox}
                      </Typography>
                      <Divider /> */}
                      <Emails />
                    </div>
                    <div className={classes.viewer}>
                      <Viewer />
                    </div>
                  </div>
                </>
              </>
            ) :
            (
              isComposeOpen &&
              <Compose /> ||
              currentEmailID &&
              <Viewer /> ||
              isSettingsOpen &&
              <Settings /> ||
              <>
                <TopBar />
                <MenuDrawer />
                <div className={classes.emailsMobile}>
                  <Typography variant="h5" style={{
                    marginTop: 10,
                    marginLeft: '2em',
                    textTransform: 'capitalize',
                  }}>
                    {currentMailbox}
                  </Typography>
                  <Divider />
                  <Emails />
                </div>
              </>
            )
          )
      }
    </div>
  );
};

export default Home;
