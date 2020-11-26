import React, {useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Paper, IconButton,
  TextField} from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import SendIcon from '@material-ui/icons/Send';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import {EmailContext} from '../context';

const useStyles = makeStyles((theme)=>({
  container: {
    zIndex: theme.zIndex.drawer + 10,
    position: 'absolute',
    height: '100%',
    width: '100%',
    // background: 'green',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  toSubject: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1),
  },
  body: {
    height: '100%',
    width: '100%',
    padding: theme.spacing(1),
  },
  bodyInput: {
    height: '100%',
    width: '100%',
    outline: 'none',
    border: 'none',
  },
}));

const Compose = () => {
  const classes=useStyles();
  const {desktop} = useContext(EmailContext);
  return (
    <Paper
      className={classes.container}>
      <div className={classes.header}>
        <IconButton>
          {
            desktop?
            <HighlightOffIcon />:
            <ArrowBackIosIcon/>
          }
        </IconButton>
        <IconButton>
          <SendIcon/>
        </IconButton>
      </div>
      <div className={classes.toSubject}>
        <TextField label="To" />
        <TextField label="Subject" />
      </div>
      <div className={classes.body}>

        <textarea className={classes.bodyInput} />
      </div>

    </Paper>
  );
};

export default Compose;
