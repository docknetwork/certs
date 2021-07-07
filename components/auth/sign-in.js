import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { Magic } from 'magic-sdk';
import fetch from 'isomorphic-unfetch';
import Router from 'next/router';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magic, setMagic] = useState('');

  async function handleSignin(e) {
    e.preventDefault();
    setIsSubmitting(true);

    let did;
    try {
      did = await magic.auth.loginWithMagicLink({ email });
    } catch (error) {
      // Magic handles errors UI
      setIsSubmitting(false);
      return;
    }
    const authRequest = await fetch('/api/auth', {
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

      const gotoOnboarding = authData.new || !authData.user.name;
      Router.push(gotoOnboarding ? '/issuer/onboarding' : '/issuer/dashboard');
    } else {
      setIsSubmitting(false);
      throw new Error('No sign in token');
    }

    setIsSubmitting(false);
  }

  function handleChangeEmail(e) {
    setEmail(e.target.value);
  }

  useEffect(() => {
    Router.prefetch('/issuer/onboarding');
    Router.prefetch('/issuer/dashboard');
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
          disabled={isSubmitting}
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          disabled={isSubmitting}
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
