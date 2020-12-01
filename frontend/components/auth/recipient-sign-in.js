import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';

import { apiPost } from '../../services/api';

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

function getStorageValue(key) {
  let localRef;
  if (typeof localStorage !== 'undefined') {
    localRef = localStorage.getItem(key);
    if (localRef === 'null' || localRef === 'undefined') {
      localRef = null;
    }
  }
  return localRef;
}

export default function ({ className, setCredentials, updateUser }) {
  const router = useRouter();
  const classes = useStyles();
  const [reference, setReference] = useState();
  const [error, setError] = useState('');
  const localRef = getStorageValue('recipientRef');

  useEffect(() => {
    if (!reference) {
      const ref = (router.query && router.query.reference) || localRef;
      if (ref) {
        setReference(ref);
        loadCredentials(ref);
      }
    }
  }, []);

  async function handleSignin(event) {
    if (event) {
      event.preventDefault();
    }

    loadCredentials(reference);
  }

  async function loadCredentials(ref) {
    setError(null);

    localStorage.setItem('recipientRef', ref);

    try {
      const result = await apiPost('recipient', {
        reference: ref,
      });

      if (result.length) {
        updateUser();
        setCredentials(result);
      } else {
        setError('You have not been issued any credentials.');
        localStorage.removeItem('recipientRef');
      }
    } catch (e) {
      setError('Unable to get credentials, please check your reference.');
      localStorage.removeItem('recipientRef');
    }
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
          disabled={!reference || localRef}
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
