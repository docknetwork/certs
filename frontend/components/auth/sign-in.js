import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { Magic } from 'magic-sdk';
import fetch from 'isomorphic-unfetch';
import Router from 'next/router';

import { hasAuthToken } from '../../helpers/auth';

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

export default function ({ className, onSignin }) {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [magic, setMagic] = useState('');

  async function handleSignin(e) {
    e.preventDefault();

    let did;
    try {
      did = await magic.auth.loginWithMagicLink({ email });
    } catch (error) {
      // Magic handles errors UI
      return;
    }
    const authRequest = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${did}` },
    });

    const authData = await authRequest.json();

    if (authData.token) {
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('authUser', JSON.stringify(authData.user));
      if (onSignin) {
        onSignin();
      }

      const gotoOnboarding = authData.new || !authData.user.entityName;
      Router.push(gotoOnboarding ? '/issuer/onboarding' : '/issuer');
    } else {
      throw new Error('No sign in token');
    }
  }

  function handleChangeEmail(e) {
    setEmail(e.target.value);
  }

  useEffect(() => {
    if (hasAuthToken()) {
      // Router.push(`/issuer`);
    }
    setMagic(new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY));
  }, []);

  return (
    <div {...{ className }}>
      <img style={{ margin: '5px auto 30px auto' }} width="155.97px" height="40px" src={'/static/img/certs-logo.svg'} />
      <Typography component="h1" variant="h5">
        Sign in or create an account
      </Typography>
      <br /><br />
      <form className={classes.form} noValidate onSubmit={handleSignin}>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={handleChangeEmail}
          required
        />
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label="Remember me"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
        >
          Sign In
        </Button>
        <Box mt={5}>
          <Typography variant="caption" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
            By continuing, you agree to our <a href="https://www.dock.io/privacy" target="_blank" rel="noreferrer" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Privacy Policy</a> and to be contacted by email about our services.
          </Typography>
        </Box>
      </form>
    </div>
  );
}
