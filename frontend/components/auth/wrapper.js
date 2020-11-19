import React, { useEffect } from 'react';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { Ring } from 'react-awesome-spinners';
import Router from 'next/router';

import Fade from 'react-reveal/Fade';
import { hasAuthToken } from '../../helpers/auth';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  loaderWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '40px auto 40px auto',
  },
}));

const isServer = () => typeof window === 'undefined';

export default function AuthWrapper({ children, showLoad }) {
  const classes = useStyles();

  useEffect(() => {
    if (!hasAuthToken()) {
      Router.push('/');
    }
  }, []);

  return (
    <Container maxWidth="lg" className={classes.container}>
      {(isServer() || showLoad) ? (
        <div className={classes.loaderWrapper}>
          <Ring />
        </div>
      ) : (
        <Fade>
          <React.Fragment>
            {children}
          </React.Fragment>
        </Fade>
      )}
    </Container>
  );
}
