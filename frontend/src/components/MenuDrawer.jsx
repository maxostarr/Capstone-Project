import React, {useContext, useState, useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Divider,
  Drawer,
  List,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
  TextField,
  ListItem,
  ListItemIcon,
  ListItemText} from '@material-ui/core';
import {Inbox,
  Star,
  ArrowForward,
  // Drafts,
  Delete,
  MailOutline,
  Add,
  Settings} from '@material-ui/icons';
// import {useHistory} from 'react-router';
import {EmailContext} from '../context';
import {emailClient} from '../request';
// start code from https://material-ui.com/components/drawers/

const useStyles = makeStyles((theme)=>({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  drawer: {
    // width: drawerWidth,
    flexShrink: 0,
    marginTop: theme.spacing(8),
  },
  paper: {
    marginTop: theme.spacing(8),
    // width: drawerWidth,
  },
  itemText: {
    textTransform: 'capitalize',
  },
}));

const builtInMailboxes = [
  {
    icon: <Inbox />,
    text: 'inbox',
  },
  {
    icon: <Star />,
    text: 'starred',
  },
  {
    icon: <ArrowForward />,
    text: 'sent',
  },
  // {
  //   icon: <Drafts />,
  //   text: 'drafts',
  // },
  {
    icon: <Delete />,
    text: 'trash',
  },
];

const builtInMailboxesNames = builtInMailboxes.map((i)=>i.text);

// const userMailboxes = [
//   {
//     text: 'work',
//     count: 0,
//   },
//   {
//     text: 'school',
//     count: 2135,
//   },
//   {
//     text: 'family',
//     count: 4,
//   },
// ];

const MenuDrawer = () => {
  const [builtIn, setBuiltIn] = useState(builtInMailboxes);
  const [userMailboxes, setUserMailboxes] = useState([]);
  const [newMailboxDialogOpen, setNewMailboxDialogOpen] = useState(false);
  const [newMailboxName, setNewMailboxName] = useState('');
  // const history = useHistory();
  const classes = useStyles();
  const {isDrawerOpen,
    setIsDrawerOpen,
    currentMailbox,
    setCurrentMailbox,
    setCurrentMailboxID,
    setMailboxes,
    setIsSettingsOpen,
    email,
    // emailClient,
    desktop} = useContext(EmailContext);
  const openSettings = () => setIsSettingsOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const getMailboxes = async () => {
    try {
      const res = await emailClient.get('http://localhost:3010/v0/mailbox/summary');
      const json = res.data;
      setMailboxes(json);
      setBuiltIn(builtInMailboxes.map((mailbox)=>{
        const {id, size} = json.find((m)=>m.name===mailbox.text);
        if (mailbox.text === currentMailbox) {
          setCurrentMailboxID(id);
        }
        return {
          ...mailbox,
          id,
          count: size,
        };
      }));
      setUserMailboxes(json.map((mailbox)=>{
        if (builtInMailboxesNames.includes(mailbox.name)) {
          return;
        }
        return {
          text: mailbox.name,
          id: mailbox.id,
          count: mailbox.size,
        };
      }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getMailboxes();
  }, [isDrawerOpen, email]);

  const handleClose = ()=>setNewMailboxDialogOpen(false);


  const addNewMailbox = async () => {
    try {
      await emailClient.post(encodeURI(`http://localhost:3010/v0/mailbox?name=${newMailboxName}`));
      handleClose();
      getMailboxes();
    } catch (e) {
      console.error(e);
    }
  };


  const listItemsBuiltIn = builtIn.map((item, i)=>
    <>
      <ListItem selected={currentMailbox===item.text}
        onClick={()=>{
          setCurrentMailbox(item.text);
          setCurrentMailboxID(item.id);
          closeDrawer();
        }}
        button
        key={`menu-item-${item.text}`}>
        <ListItemIcon>
          {item.icon}
        </ListItemIcon>
        <ListItemText className={classes.itemText}>{item.text}</ListItemText>
        <div style={{flexGrow: 1}}/>
        {item.count>=1&&(item.count.toLocaleString())}
      </ListItem>
      {i===0&&<Divider key="divider-dynamic"/>}
    </>,
  );
  const listItemsUser = userMailboxes.map((item, i)=> {
    if (!item) {
      return;
    }
    return (
      <ListItem selected={currentMailbox===item.text}
        onClick={()=>{
          setCurrentMailbox(item.text);
          setCurrentMailboxID(item.id);
          closeDrawer();
        }}
        button
        key={`menu-item-user-${item.text}`}>
        <ListItemIcon>
          <MailOutline/>
        </ListItemIcon>
        <ListItemText className={classes.itemText}>{item.text}</ListItemText>
        <div style={{flexGrow: 1}}/>
        {item.count>=1&&(item.count.toLocaleString())}
      </ListItem>);
  },
  );


  return (
    <>
      {/* https://material-ui.com/components/dialogs/ */}
      <Dialog open={newMailboxDialogOpen}
        onClose={handleClose}
        aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New Mailbox</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the name for your new mailbox!
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Mailbox Name"
            type="text"
            fullWidth
            value={newMailboxName}
            onChange={(e)=>setNewMailboxName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={addNewMailbox} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Drawer anchor="left" open={isDrawerOpen}
        onClose={closeDrawer}
        variant={desktop ? 'permanent':'temporary'}
        className={desktop?classes.drawer:''}
        classes={
        desktop?
        {
          paper: classes.paper,
        }:{}}
      >
        <List className={classes.list}>
          <ListItem button key="menu-item-heading">
            <ListItemText>CSE 183 Mail</ListItemText>
          </ListItem>
          {listItemsBuiltIn}
          <Divider key="divider-static-1"/>
          {listItemsUser}
          <Divider key="divider-static-2"/>
          <ListItem button key="menu-item-new-mailbox"
            onClick={()=>setNewMailboxDialogOpen(true)}>
            <ListItemIcon>
              <Add />
            </ListItemIcon>
            <ListItemText
              className={classes.itemText}>new mailbox</ListItemText>
          </ListItem>
          <Divider key="divider-static-3"/>
          <ListItem button key="menu-item-settings" onClick={()=>{
            closeDrawer(); openSettings();
          }}>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText className={classes.itemText}>settings</ListItemText>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default MenuDrawer;
