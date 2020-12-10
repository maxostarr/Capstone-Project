import React, {useContext, useState, useEffect} from 'react';
import {
  List, ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
} from '@material-ui/core';
import {StarBorder, Star} from '@material-ui/icons';
import {EmailContext} from '../context';

import {emailClient} from '../request';

const Emails = () => {
  const today = new Date();
  const {
    currentMailboxID,
    setCurrentEmailID,
    currentEmailID,
    mailFilter,
    desktop,
    email,
    // emailClient,
  } = useContext(EmailContext);
  const [emails, setemails] = useState([]);

  const setStar = async (id, starStatus) => {
    try {
      await emailClient.get(`http://localhost:3010/v0/mail/star/${id}?starred=${starStatus}`);
      const updatedEmailList = emails.map((email) => {
        if (email.id === id) {
          return {
            ...email,
            starred: starStatus,
          };
        }
        return email;
      });
      setemails(updatedEmailList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(async () => {
    if (!currentMailboxID) {
      return;
    }
    try {
      const res = await emailClient.get(`http://localhost:3010/v0/mailbox/by/${currentMailboxID}`);
      const json = res.data;
      if (desktop&&!currentEmailID) {
        setCurrentEmailID(json[0].id);
      }
      if (res.status !== 404) {
        const withDate = json.map((email) => {
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
        });
        setemails(withDate);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentMailboxID, email]);

  const filterRegex = RegExp(mailFilter, 'i');
  const emailList = emails
      .filter((email) => {
        if (
          filterRegex.test(email.from.name) ||
      filterRegex.test(email.from.email) ||
      filterRegex.test(email.subject) ||
      filterRegex.test(email.content)
        ) {
          return email;
        }
      })
      .map((email) => (
        <ListItem key={email.id} button
          onClick={() => setCurrentEmailID(email.id)}
        >

          <ListItemAvatar>
            <Avatar src={email.from.avatar}>
              {email.from.name[0]}
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={
            <div>
              <div style={{display: 'flex'}}>
                <span style={{fontWeight: email.unread ? 'bold' : ''}}>
                  {email.from.name}
                </span>
                <div style={{flexGrow: 1}} />
                {email.time}
              </div>
              <Typography style={{fontWeight: email.unread ? 'bold' : ''}}
                variant="body1" noWrap >
                {email.subject}
              </Typography>
              <Typography variant="body2" noWrap>
                {(() => {
                  try {
                    return JSON.parse(email.content).raw;
                  } catch (e) {
                    return email.content;
                  }
                })()}
              </Typography>
            </div>
          }
            // secondary={}

          />
          <ListItemSecondaryAction>
            <IconButton onClick={() => {
              setStar(email.id, !email.starred);
            }}>
              {
            email.starred ? <Star /> : <StarBorder />
              }
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ));

  return (
    <List>
      {emailList}
    </List>
  );
};

export default Emails;
