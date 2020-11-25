import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Fade from 'react-reveal/Fade';
import Link from 'next/link';

import dynamic from 'next/dynamic';
import RecipientSignIn from '../components/auth/recipient-sign-in';
import CredentialDisplayJSON from '../components/credential-json-display';

const CredentialModal = dynamic(() => import('../components/modals/credential'));

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
  credentialWrapper: {
    width: '262px',
    height: '323px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    transform: 'translate(0, 0px)',
    display: 'block',
    textDecoration: 'none',
    '&:hover': {
      transform: 'translate(0, -4px)',
    },
  },
}));

const isServer = () => typeof window === 'undefined';

export default function IssuerIndex() {
  const classes = useStyles();
  const [credentials, setCredentials] = useState([]);
  const [showCredential, setShowCredential] = useState(false);

  function handleShowCredential(e, credential) {
    e.preventDefault();
    setShowCredential(credential);
  }

  function handleCloseCredential() {
    setShowCredential(false);
  }

  return (isServer() || credentials.length <= 0) ? (
    <div className={classes.signinRoot}>
      <Paper variant="outlined" className={classes.signinPaperWrapper}>
        <RecipientSignIn className={classes.signinPaper} setCredentials={setCredentials} />
      </Paper>
    </div>
  ) : (
    <Box mt={8}>
      <Container maxWidth="md">
        <Grid container spacing={4}>
          {credentials.map((credential, index) => (
            <Grid item key={credential._id}>
              <Fade delay={index * 200}>
                <Link href={`/credential/${credential._id}`} passHref>
                  <Paper elevation={10} className={classes.credentialWrapper} component="a" onClick={(e) => handleShowCredential(e, credential)}>
                    <CredentialDisplayJSON credential={credential.credential} schema={credential.template} scale={0.5} />
                  </Paper>
                </Link>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      <CredentialModal key={showCredential} credential={showCredential} onClose={handleCloseCredential} open={!!showCredential} />
    </Box>
  );
}
