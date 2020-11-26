import React, {useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
} from '@material-ui/core';
import {
  Search, AccountCircle,
  Mail, Menu as MenuIcon,
} from '@material-ui/icons';

import {EmailContext} from '../context';
// starter code from https://material-ui.com/components/app-bar/
const useStyles = makeStyles((theme) => ({
  bar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  rightButton: {
    marginLeft: theme.spacing(2),
  },
  search: {
    'flexGrow': 1,
    'maxWidth': '40em',
  },
  // from https://stackoverflow.com/questions/52911169/how-to-change-the-border-color-of-material-ui-textfield
  notchedOutline: {
    borderWidth: '1px',
    borderColor: 'rgba(255,255,255,0.5) !important',
  },
  searchInput: {
    color: 'white',
  },
  menuLabel: {
    textTransform: 'capitalize',
  },
}));

const TopBar = () => {
  const classes = useStyles();
  const {setIsDrawerOpen, currentMailbox, desktop} = useContext(EmailContext);
  return (
    <AppBar position="static" className={classes.bar}>
      <Toolbar>
        {
          !desktop&&
          <IconButton onClick={() => setIsDrawerOpen(true)} edge="start"
            className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>||
          <Typography className={classes.menuLabel}>
            {`CSE183 Mail - ${currentMailbox}`}
          </Typography>
        }

        {/* starter from https://material-ui.com/components/text-fields/ */}
        <div className={classes.grow} />

        <TextField
          className={classes.search}
          placeholder="Search"
          size="small"
          variant="outlined"
          InputProps={{

            className: classes.searchInput,
            // from https://stackoverflow.com/questions/52911169/how-to-change-the-border-color-of-material-ui-textfield
            classes: {
              notchedOutline: classes.notchedOutline,
            },
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <div className={classes.grow} />
        <IconButton
          edge="start"
          className={classes.rightButton}
          color="inherit">
          <Mail />
        </IconButton>
        <IconButton
          edge="start"
          // className={classes.menuButton}
          color="inherit">
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
