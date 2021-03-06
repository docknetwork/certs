import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function ({
  className, loadCredentials, error,
}) {
  const classes = useStyles();
  const [reference, setReference] = useState();

  async function handleSignin(event) {
    if (event) {
      event.preventDefault();
    }

    loadCredentials(reference);
  }

  function handleChangeReference(e) {
    setReference(e.target.value);
  }

  return (
    <div {...{ className }}>
      <img style={{ margin: '5px auto 30px auto' }} width="155.97px" height="40px" src={'/static/img/certs-logo.svg'} />
      <center>
        <Typography component="h1" variant="h5">
          Enter your reference to view your credentials
        </Typography>
      </center>
      <br />
      <form className={classes.form} noValidate onSubmit={handleSignin}>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="reference"
          label="Recipient Reference"
          name="reference"
          autoComplete="reference"
          autoFocus
          value={reference}
          onChange={handleChangeReference}
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={!reference}
          className={classes.submit}
        >
          View Credentials
        </Button>

        {error && (
          <MuiAlert severity="error">
            {error}
          </MuiAlert>
        )}
      </form>
    </div>
  );
}
