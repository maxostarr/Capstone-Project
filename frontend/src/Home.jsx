import {

  Typography,
  Divider,
} from '@material-ui/core';
import React from 'react';
import MenuDrawer from './components/MenuDrawer';
import TopBar from './components/TopBar';
import Compose from './components/Compose';

const Home = () => {
  return (
    <div>
      <Compose />
      <TopBar />
      <MenuDrawer />
      <div>
        <Typography variant="h5" style={{marginTop: 10, marginLeft: '2em'}}>
          Inbox
        </Typography>
        <Divider />
      </div>
    </div>
  );
};

export default Home;
