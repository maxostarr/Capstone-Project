import React, {useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText} from '@material-ui/core';
import {Inbox,
  Star,
  ArrowForward,
  Drafts,
  Delete,
  MailOutline,
  Add,
  Settings} from '@material-ui/icons';
import {EmailContext} from '../context';
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
    count: 4,
  },
  {
    icon: <Star />,
    text: 'starred',
    count: 7,
  },
  {
    icon: <ArrowForward />,
    text: 'sent',
    count: 0,
  },
  {
    icon: <Drafts />,
    text: 'drafts',
    count: 6,
  },
  {
    icon: <Delete />,
    text: 'trash',
    count: 20000,
  },
];

const userMailboxes = [
  {
    text: 'work',
    count: 0,
  },
  {
    text: 'school',
    count: 2135,
  },
  {
    text: 'family',
    count: 4,
  },

];

const MenuDrawer = () => {
  const classes = useStyles();
  const {isDrawerOpen,
    setIsDrawerOpen,
    currentMailbox,
    setCurrentMailbox,
    desktop} = useContext(EmailContext);

  const listItemsBuiltIn = builtInMailboxes.map((item, i)=>
    <>
      <ListItem selected={currentMailbox===item.text}
        onClick={()=>setCurrentMailbox(item.text)}
        button key={`menu-item-${item.text}`}>
        <ListItemIcon>
          {item.icon}
        </ListItemIcon>
        <ListItemText className={classes.itemText}>{item.text}</ListItemText>
        <div style={{flexGrow: 1}}/>
        {item.count>1&&(item.count.toLocaleString())}
      </ListItem>
      {i===0&&<Divider key="divider-dynamic"/>}
    </>,
  );
  const listItemsUser = userMailboxes.map((item, i)=>
    <ListItem selected={currentMailbox===item.text}
      onClick={()=>setCurrentMailbox(item.text)}
      button key={`menu-item-user-${item.text}`}>
      <ListItemIcon>
        <MailOutline/>
      </ListItemIcon>
      <ListItemText className={classes.itemText}>{item.text}</ListItemText>
      <div style={{flexGrow: 1}}/>
      {item.count>1&&(item.count.toLocaleString())}
    </ListItem>,
  );
  return (
    <Drawer anchor="left" open={isDrawerOpen}
      onClose={()=>setIsDrawerOpen(false)}
      variant={desktop ? 'permanent':'temporary'}
      className={desktop?classes.drawer:''}
      classes={
        desktop?
        {
          paper: classes.paper,
        }:{}}
    >
      <List className={classes.list}>
        <ListItem button key="heading">
          <ListItemText>CSE 183 Mail</ListItemText>
        </ListItem>
        {listItemsBuiltIn}
        <Divider key="divider-static-1"/>
        {listItemsUser}
        <Divider key="divider-static-2"/>
        <ListItem button key="new-mailbox">
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText className={classes.itemText}>new mailbox</ListItemText>
        </ListItem>
        <Divider key="divider-static-3"/>
        <ListItem button key="settings">
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText className={classes.itemText}>settings</ListItemText>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default MenuDrawer;
