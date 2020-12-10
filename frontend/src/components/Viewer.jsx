import React, {useContext, useState, useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {
  Paper,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
} from '@material-ui/core';
import {EmailContext} from '../context';
import {
  ArrowBackIos,
  Delete,
  Mail,
  MoveToInbox,
  StarBorder,
  Star,
  ArrowBack,
} from '@material-ui/icons';
import {EditorState, convertFromRaw} from 'draft-js';
import {Editor} from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {emailClient} from '../request';

const useStyles = makeStyles((theme) => ({
  container: {
    zIndex: theme.zIndex.drawer + 10,
    position: 'absolute',
    height: '100%',
    width: '100%',
    // background: 'green',
  },
  header: {
    display: 'flex',
    // justifyContent: 'space-between',
  },
  subject: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1),
  },
  avatar: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  from: {
    display: 'flex',
    flexDirection: 'column',
    // padding: theme.spacing(1),
  },
  menuItem: {
    textTransform: 'capitalize',
  },
  mailbox: {
    textTransform: 'capitalize',
    width: 'max-content',
    background: theme.palette.grey[100],
    padding: theme.spacing(0.5),
  },
  content: {
    padding: theme.spacing(1),
  },
}));

const withTimeString = (email) => {
  const today = new Date();
  const at = new Date(email.received);
  if (at.getDate() === today.getDate() &&
    at.getFullYear() === today.getFullYear() &&
    at.getMonth() === today.getMonth()) {
    return {
      ...email,
      time: at.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }
  if (at.getFullYear() === today.getFullYear()) {
    return {
      ...email,
      time: at.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };
  }
  return {
    ...email,
    time: at.getFullYear(),
  };
};

const Viewer = () => {
  const {
    currentEmailID,
    setCurrentEmailID,
    setComposeAutofill,
    setIsComposeOpen,
    mailboxes,
    desktop,
    email,
    setEmail,
  } = useContext(EmailContext);
  const classes = useStyles();
  // const [email, setEmail] = useState({});
  const [anchorEl, setAnchorEl] = useState();

  const setStar = async (id, starStatus) => {
    try {
      await emailClient.get(`http://localhost:3010/v0/mail/star/${id}?starred=${starStatus}`);
      setEmail({
        ...email,
        starred: starStatus,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnread = async () => {
    try {
      await emailClient.put(`http://localhost:3010/v0/mail/unread/${currentEmailID}?unread=${true}`);
      // setCurrentEmailID(null);
      setEmail({
        ...email,
        unread: true,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(async () => {
    if (!currentEmailID) {
      return;
    }
    try {
      const res = await emailClient.get(`http://localhost:3010/v0/mail/${currentEmailID}`);
      const json = res.data;
      if (res.status !== 404) {
        const withTime = withTimeString(json);
        setEmail({...withTime, unread: false});
      }
      await emailClient.put(`http://localhost:3010/v0/mail/unread/${currentEmailID}?unread=${false}`);
    } catch (e) {
      console.error(e);
    }
  }, [currentEmailID]);

  const moveEmail = async (targetMailboxID) => {
    const {name} = mailboxes.find((m)=>m.id===targetMailboxID);
    try {
      await emailClient.post(`/mail/move`, null, {
        params: {
          email: currentEmailID,
          mailbox: targetMailboxID,
        },
      });
      setEmail(
          {
            ...email,
            mailbox: name,
          },
      );
    } catch (e) {
      console.error(e);
    }
  };

  const trashEmail = async () => {
    const {id} = mailboxes.find((m)=>m.name==='trash');
    await moveEmail(id);
    setCurrentEmailID(null);
  };
  // https://material-ui.com/components/menus/
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {
        email.hasOwnProperty('time') &&

        <Paper
          className={!desktop?classes.container:''}>
          <div className={classes.header}>
            {
              !desktop&&
          ( <IconButton onClick={() => setCurrentEmailID(null)}>
            <ArrowBackIos />
          </IconButton>)
            }
            <div style={{flexGrow: 1}} />
            <IconButton onClick={handleUnread}>
              <Mail />
            </IconButton>
            {/* https://material-ui.com/components/menus/ */}
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {mailboxes
                  .filter((m)=>m.name!=='sent'&&m.name!=='starred')
                  .map((m)=>(
                    <MenuItem
                      key={m.id}
                      className={classes.menuItem}
                      onClick={()=>{
                        moveEmail(m.id);
                        handleClose();
                      }}
                    >{m.name}</MenuItem>
                  ))}
            </Menu>
            <IconButton onClick={handleClick}>
              <MoveToInbox />
            </IconButton>
            <IconButton onClick={trashEmail}>
              <Delete />
            </IconButton>
          </div>
          <div className={classes.header}>
            <div className={classes.subject}>
              <Typography variant="h6" >
                {email.subject}
              </Typography>
              <div className={classes.mailbox}>
                {email.mailbox}
              </div>
            </div>
            <div style={{flexGrow: 1}} />
            <IconButton onClick={() => {
              setStar(email.id, !email.starred);
            }}>
              {
                email.starred ? <Star /> : <StarBorder />
              }
            </IconButton>
          </div>
          <div className={classes.header}>
            <Avatar className={classes.avatar}>
              {email.from.name[0]}
            </Avatar>
            <div className={classes.from}>
              <div>
                <Typography display="inline">
                  {email.from.name}
                </Typography>
                {' - '}
                <Typography variant="caption" >
                  {email.time}
                </Typography>
              </div>
              <div>
                {email.from.email}
              </div>
            </div>
            <div style={{flexGrow: 1}} />
            <IconButton onClick={() => {
              setComposeAutofill({
                email: email.from.email,
                subject: `Re: ${email.subject}`,
              });
              setIsComposeOpen(true);
              setCurrentEmailID(null);
            }}>
              <ArrowBack />
            </IconButton>
          </div>
          <div className={classes.content}>
            {(()=>{
              try {
                return (
                  <Editor
                    readOnly
                    toolbarHidden
                    editorState={
                      EditorState.createWithContent(
                          convertFromRaw(JSON.parse(email.content).rich),
                      )
                    }/>
                );
              } catch (e) {
                return email.content;
              }
            })()
            }


          </div>
        </Paper> ||
        'Loading...'
      }</>
  );
};

export default Viewer;
