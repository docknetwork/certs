import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Fade from 'react-reveal/Fade';
import Link from 'next/link';
import { useRouter } from 'next/router';

import dynamic from 'next/dynamic';
import { apiPost } from '../services/api';

import RecipientSignIn from '../components/auth/recipient-sign-in';
import CredentialDisplayJSON from '../components/credential-json-display';
import getStorageValue from '../helpers/localstorage';

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

export default function Index({ updateUser }) {
  const classes = useStyles();
  const router = useRouter();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [showCredential, setShowCredential] = useState(false);
  const localRef = getStorageValue('recipientRef');

  function handleShowCredential(e, credential) {
    e.preventDefault();
    setShowCredential(credential);
  }

  function handleCloseCredential() {
    setShowCredential(false);
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
    setLoading(false);
  }

  useEffect(() => {
    const ref = (router.query && router.query.reference) || localRef;
    if (ref) {
      loadCredentials(ref);
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <center>
        <br /><br />
        <CircularProgress />
      </center>
    );
  }

  return credentials.length <= 0 ? (
    <div className={classes.signinRoot}>
      <Paper variant="outlined" className={classes.signinPaperWrapper}>
        <RecipientSignIn error={error} className={classes.signinPaper} loadCredentials={loadCredentials} updateUser={updateUser} />
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

      <CredentialModal
        key={showCredential}
        credential={showCredential}
        credentialId={showCredential && showCredential._id}
        onClose={handleCloseCredential}
        open={!!showCredential}
        canCreatePresentation={true} />
    </Box>
  );
}
