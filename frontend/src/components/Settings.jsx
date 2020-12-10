import React, {useState} from 'react';
import {Paper,
  IconButton,
  Avatar,
  Typography,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {ArrowBackIos,
  Save} from '@material-ui/icons';
import {useHistory} from 'react-router';
import {useContext} from 'react';
import {emailClient} from '../request';
import {EmailContext} from '../context';


const useStyles = makeStyles((theme) => ({
  container: {
    zIndex: theme.zIndex.drawer + 10,
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const Settings = () => {
  const {user, setUser, loadUser, setIsSettingsOpen} = useContext(EmailContext);
  const history = useHistory();
  const classes = useStyles();
  const [newImageOpen, setNewImageOpen] = useState(false);
  const [newImage, setNewImage] = useState('');
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showAvatar, setShowAvatar] = useState(user.showAvatar);
  const [username, setUsername] = useState(user.username);

  const goHome = () => setIsSettingsOpen(false);

  const openImageDialog = () => setNewImageOpen(true);
  const closeImageDialog = () => setNewImageOpen(false);

  const openUnsavedChanges = () => setShowUnsavedChanges(true);
  const closeUnsavedChanges = () => setShowUnsavedChanges(false);

  const exitSettings = () => {
    if (unsavedChanges) {
      openUnsavedChanges();
      return;
    }
    goHome();
  };

  const postChangesToServer = async () => {
    try {
      const {data} = await emailClient.post('/user/update', {
        username,
        avatar: user.avatar,
        showAvatar,
      });
      window.localStorage.setItem('accessToken',
          data.accessToken);
    } catch (e) {
      console.error(e);
    }
  };

  const logOut = async () => {
    await saveChanges();
    window.localStorage.removeItem('accessToken');
    setIsSettingsOpen(false);
    history.push('/login');
  };

  const saveChanges = async () =>{
    await postChangesToServer();
    setUnsavedChanges(false);
    closeUnsavedChanges();
    loadUser();
  };

  const saveNewImage = () => {
    setUser({
      ...user,
      avatar: newImage,
    });
    closeImageDialog();
    setUnsavedChanges(true);
  };

  const updateUsername = (e)=>{
    setUsername(e.target.value);
    setUnsavedChanges(true);
  };

  const handleShowAvatarToggle = (e)=>{
    console.log(e.target.checked);
    setShowAvatar(e.target.checked);
    setUnsavedChanges(true);
  };

  return (
    <>
      <Dialog
        open={newImageOpen}
        onClose={closeImageDialog}
        aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Profile Image</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a URL for your new profile image
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Image URL"
            type="text"
            fullWidth
            value={newImage}
            onChange={(e)=>setNewImage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeImageDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={saveNewImage} color="primary">
            Change
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showUnsavedChanges}
        onClose={closeUnsavedChanges}
        aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Save Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to save your changes?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={goHome} color="primary">
            No
          </Button>
          <Button onClick={saveChanges} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Paper className={classes.container}>
        <div className={classes.header}>
          <IconButton onClick={exitSettings}>
            <ArrowBackIos />
          </IconButton>
          <IconButton onClick={saveChanges}>
            <Save />
          </IconButton>
        </div>
        <div className={classes.body}>
          <div className={classes.info}>
            <Avatar
              onClick={openImageDialog}
              src={user.avatar}
              style={{marginRight: '1em',
                height: '3em',
                width: '3em',
              }}>
              {user.username[0]}
            </Avatar>
            <div
              style={{
                width: 'max-content',
                display: 'flex',
                flexDirection: 'column',
              }}>

              <TextField
                value={username}
                onChange={updateUsername}

              />
              <Typography variant="caption">
                {user.email}
              </Typography>
            </div>
          </div>
          <div>
            <Checkbox value={showAvatar} onClick={handleShowAvatarToggle} />
             Show Avatar
          </div>
          <Button color="secondary"
            variant="contained"
            onClick={logOut}>Log Out</Button>
        </div>
      </Paper>
    </>
  );
};

export default Settings;
