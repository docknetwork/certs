import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import Fade from 'react-reveal/Fade';
import moment from 'moment';

import ErrorIcon from '@material-ui/icons/Error';
import CredentialDisplayJSON from './credential-json-display';

import { getCredential } from '../services/credentials';
import { verifyVC } from '../helpers/vc';

const useStyles = makeStyles((theme) => ({
  infoTitle: {
    display: 'block',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  infoText: {
    display: 'block',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  displayWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  displayHeader: {
    display: 'flex',
    height: theme.spacing(4),
  },
  verifiedState: {
    display: 'flex',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 14,
    fontWeight: '500',
  },
  viewJSONLink: {
    marginLeft: 'auto',
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: '12px',
    marginBottom: '10px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  jsonWrapper: {
    width: '524px',
    height: '647px',
    overflowY: 'scroll',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: '4px',
    background: '#444444',
    color: '#FFFFFF',
    padding: '5px 20px',
    fontSize: '14px',
  },
}));

const infoTitles = {
  issuanceDate: 'Issue Date',
  expirationDate: 'Expiration Date',
  issuedBy: 'Issued by',
  issuerDID: 'Issuer\'s DID',
  recipientName: 'Issued to',
  recipientDID: 'Recipient DID',
};

const verifiedStateLabels = [
  'Verifying...',
  'Not verified',
  'Authenticity verified',
];

export default function Credential({ id, cachedCredential, setVC }) {
  const classes = useStyles();
  const [credential, setCredential] = useState(null);
  const [viewJSON, setViewJSON] = useState(false);
  const [verifiedState, setVerifiedState] = useState(0);
  const vc = credential && credential.credential;
  const credentialData = vc && {
    issuanceDate: new Date(vc.issuanceDate),
    expirationDate: new Date(vc.expirationDate),
    issuedBy: vc.credentialSubject[0].alumniOf, // TODO: this isnt a good way fo getting issuer name because it wont be in other credential types
    issuerDID: vc.issuer,
    recipientName: vc.credentialSubject[0].name,
    recipientDID: vc.credentialSubject[0].id,
  };

  async function verifyCredential(signedVC) {
    setVerifiedState(0);
    const verifyResult = await verifyVC(signedVC);
    if (verifyResult.verified) {
      setVerifiedState(2);
    } else {
      setVerifiedState(1);
    }
  }

  async function loadCredential() {
    let result;
    if (cachedCredential) {
      result = cachedCredential;
    } else {
      result = await getCredential(id);
    }
    if (setVC) {
      setVC(result.credential);
    }
    setCredential(result);
    verifyCredential(result.credential);
  }

  function handleToggleJSONView() {
    setViewJSON(!viewJSON);
  }

  useEffect(() => {
    if (!credential || credential._id !== id) {
      loadCredential();
    }
  }, [id]);

  const verifiedIcons = [(
    <CircularProgress key={'progress'} size={20} style={{ marginRight: '8px', transform: 'translate(0, -3px)' }} />
  ), (
    <ErrorIcon key={'error'} style={{ color: '#FF0000', marginRight: '8px', transform: 'translate(0, -3px)' }} />
  ), (
    <CheckCircleIcon key={'verified'} style={{ color: '#02BEB2', marginRight: '8px', transform: 'translate(0, -3px)' }} />
  )];

  function renderFields() {
    const fields = [];
    const keys = Object.keys(credentialData);

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (credentialData[k]) {
        const value = typeof credentialData[k].getMonth === 'function'
          ? moment(credentialData[k]).format('MMMM Do, YYYY') : credentialData[k].toString();
        if (value) {
          fields.push((
            <React.Fragment key={i}>
              <Typography variant="caption" gutterBottom className={classes.infoTitle}>
                {infoTitles[k]}
              </Typography>
              <Typography variant="body2" className={classes.infoText} noWrap>
                {value}
              </Typography>
              <br />
            </React.Fragment>
          ));
        }
      }
    }
    return fields;
  }

  return (
    <Box pt={8} style={{ backgroundColor: '#F9FAFB', height: '100%', width: '100%' }}>
      {credential && (
        <Fade>
          <Container maxWidth="md">
            <Grid container spacing={6}>
              <Grid item xs={12} sm={12} md={7}>
                <div className={classes.displayWrapper}>
                  <div className={classes.displayHeader}>
                    <div className={classes.verifiedState}>
                      {verifiedIcons[verifiedState]}
                      {verifiedStateLabels[verifiedState]}
                    </div>

                    <a onClick={handleToggleJSONView} className={classes.viewJSONLink}>
                      {viewJSON ? 'Close' : 'View JSON'}
                    </a>
                  </div>
                  {viewJSON ? (
                    <Paper elevation={10} className={classes.jsonWrapper}>
                      <pre>
                        {JSON.stringify(credential.credential, null, 2)}
                      </pre>
                    </Paper>
                  ) : (
                    <Paper elevation={10} className={classes.scaleCredWrapper}>
                      <CredentialDisplayJSON credential={credential.credential} schema={credential.template} receiver={{
                        receiverName: credentialData.recipientName,
                      }} date={credentialData.issuanceDate} />
                    </Paper>
                  )}
                </div>
              </Grid>
              <Grid item xs={12} sm={12} md={5}>
                <div className={classes.displayHeader}></div>
                <Paper variant="outlined">
                  <Box padding={3}>
                    {renderFields()}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Fade>
      )}
    </Box>
  );
}
