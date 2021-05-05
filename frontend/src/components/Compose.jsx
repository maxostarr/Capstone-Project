import React, {useContext, useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {
  Paper,
  IconButton,
  TextField,
} from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import SendIcon from '@material-ui/icons/Send';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Autosuggest from 'react-autosuggest';
import {EditorState, convertToRaw} from 'draft-js';
import 'draft-js/dist/Draft.css';
import {Editor} from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {emailClient} from '../request';
import {EmailContext} from '../context';

const useStyles = makeStyles((theme) => ({
  container: {
    zIndex: theme.zIndex.drawer + 10,
    position: 'absolute',
    width: '100vw',
    height: '100vh',
    // background: 'green',
  },
  containerAlways: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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
  bodyInputWrapper: {
    // height: '100%',
    // width: '100%',
    flexGrow: .8,
    // overflow: 'scroll',
  },
  bodyInputEditor: {
    // height: '100%',
    // height: '40vh',
    // width: '100%',
    // flexGrow: 1,
    overflow: 'scroll',
  },
  toInput: {
    'border': 'none',
    'borderBottom': `1px solid ${theme.palette.grey[500]}`,
    'width': '100%',
    'fontFamily': theme.typography.fontFamily,
    'fontSize': theme.typography.fontSize,
    '&:focus': {
      border: 'none',
      outline: 'none',
    },
  },
  suggestionItem: {
    'cursor': 'pointer',
    '&:hover': {
      background: theme.palette.grey[300],
    },
  },
}));

const Compose = () => {
  const classes = useStyles();
  const {
    setIsComposeOpen,
    composeAutofill,
    setComposeAutofill,
    desktop} = useContext(EmailContext);
  const [to, setTo] = useState(
      (composeAutofill && composeAutofill.email) ||
    '');
  const [subject, setSubject] = useState(
      (composeAutofill && composeAutofill.subject) ||
    '');
  const [content, setContent] = useState(() => EditorState.createEmpty());
  const [contacts, setContacts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const getKnownContacts = async () => {
    try {
      const contactsVal = await emailClient.get('/user/contacts');
      setContacts(contactsVal.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getKnownContacts();
    return () => setComposeAutofill(null);
  }, []);

  const sendEmail = async () => {
    const sendTo = {
      email: to,
      name: to.split('@')[0],
    };
    // console.log(convertToRaw(content.getCurrentContent()));
    const email = {
      to: sendTo, subject,
      content: JSON.stringify({
        rich: convertToRaw(content.getCurrentContent()),
        raw: content.getCurrentContent().getPlainText(),
      }),
    };
    try {
      await emailClient.post('http://localhost:3010/v0/mail/', email);
      setIsComposeOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  // https://github.com/moroshko/react-autosuggest#installation
  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : contacts.filter((contact) =>
      contact.toLowerCase().slice(0, inputLength) === inputValue,
    );
  };

  const getSuggestionValue = (suggestion) => suggestion;

  const renderSuggestion = (suggestion) => (
    <div className={classes.suggestionItem}>
      {suggestion}
    </div>
  );

  const onSuggestionsFetchRequested = ({value}) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => setSuggestions([]);

  const inputProps = {
    placeholder: 'To',
    value: to,
    onChange: (e, {newValue: value})=>setTo(value),
    className: classes.toInput,
  };

  return (
    <Paper
      className={`${!desktop&&classes.container} ${classes.containerAlways}`}>
      <div className={classes.header}>
        <IconButton
          onClick={() => {
            setIsComposeOpen(false);
            setComposeAutofill(null);
          }}
        >
          {
            desktop ?
              <HighlightOffIcon /> :
              <ArrowBackIosIcon />
          }
        </IconButton>
        <IconButton onClick={sendEmail}>
          <SendIcon />
        </IconButton>
      </div>
      <div className={classes.toSubject}>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
        <TextField label="Subject" value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
          }} />
      </div>
      {/* <div
      className={classes.body}
      > */}
      <Editor
        // className={classes.bodyInput}
        editorState={content}
        // toolbarClassName="toolbarClassName"
        wrapperClassName={classes.bodyInputWrapper}
        editorClassName={classes.bodyInputEditor}
        onEditorStateChange={setContent}
      />
      {/* </div> */}
    </Paper>
  );
};

export default Compose;
