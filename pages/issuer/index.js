import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Router from 'next/router';

import SignIn from '../../components/auth/sign-in';

const useStyles = makeStyles((theme) => ({
  signinRoot: {
    height: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -theme.spacing(8),
  },
  signinPaperWrapper: {
    width: '100%',
    maxWidth: '400px',
  },
  signinPaper: {
    margin: theme.spacing(6, 4, 3, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

export default function IssuerIndex({ user, updateUser }) {
  const classes = useStyles();

  useEffect(() => {
    if (user) {
      Router.push('/issuer/dashboard');
    }
  }, []);

  return (
    <div className={classes.signinRoot}>
      <Paper variant="outlined" className={classes.signinPaperWrapper}>
        <SignIn className={classes.signinPaper} onSignin={updateUser} />
      </Paper>
    </div>
  );
}
