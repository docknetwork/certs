import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import SaveAltIcon from '@material-ui/icons/SaveAlt';

import useCustomSnackbar from '../../helpers/snackbar';
import { createAndSignPresentation, getKeypairByAddress, verifyVC } from '../../helpers/vc';
import downloadJSON from '../../helpers/download-json';
import { saveChainAccount } from '../../services/chain';
import KeypairEditor from '../keypair-editor';
import Dialog from '../dialog';
import AccountSelector from '../account-selector';
import AddAccountModal from './add-account';

import EmptyHero from '../misc/hero';
import AddDIDModal from './add-did';

import { DIDSelector } from './issue';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(1),
  },
  fullWidth: {
    width: '100%',
  },
  generateButton: {
    padding: 0,
    marginLeft: 'auto',
    marginTop: 'auto',
    textTransform: 'none',
    fontSize: '15px',
    fontWeight: 'normal',
  },
  formHeader: {
    fontWeight: 'normal',
    fontSize: '18px',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    display: 'flex',
  },
}));

export default function CreatePresentationModal(props) {
  const classes = useStyles();
  const snackbar = useCustomSnackbar();
  const [presentation, setPresentation] = useState();
  const [account, setAccount] = useState();
  const [chainAccount, setChainAccount] = useState();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({});
  const [did, setDID] = useState();
  const { credential, id } = props;
  const didMatches = doesDIDMatchCredential();

  function handleChangeAccount(newAccount, newChainAccount) {
    setAccount(newAccount);
    setChainAccount(newChainAccount);
  }

  function doesDIDMatchCredential(throwError = false) {
    if (!did || !credential) {
      return false;
    }

    let matches = false;
    let hasSubjectId = false;

    // Check all subjects for DID
    const subjects = credential.credentialSubject;
    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      if (subject.id !== undefined) {
        hasSubjectId = true;
      }
      matches = subject.id === did.id;
      if (matches) {
        break;
      }
    }

    // Matches if subject has no ID to test with
    if (!hasSubjectId) {
      return true;
    }

    if (!matches && throwError) {
      throw new Error(`Selected DID does not match subject's DID: ${credentialDID}`);
    }
    return matches;
  }

  async function handleSave() {
    if (doesDIDMatchCredential(true)) {
      setIsSubmitting(true);

      // Get controller keypair
      const holderKey = await getKeypairByAddress(did.controller);
      if (!holderKey) {
        throw new Error(`No keypair found for address ${did.controller}, try adding one`);
      }

      try {
        const vp = await createAndSignPresentation([credential], holderKey, did.id);
        setPresentation(vp.toJSON());
      } catch (e) {
        console.error(e);
        snackbar.showError(e.toString());
      }

      setIsSubmitting(false);
    }
  }

  function handleChange(event) {
    data[event.target.id] = event.target.value;
    setData({
      ...data,
    });
  }

  function handleDownload() {
    downloadJSON(presentation, `${id}-presentation`);
    props.onClose(presentation);
  }

  const actions = presentation ? null : (
    <>
      <Button onClick={() => props.onClose()}>
        Cancel
      </Button>
      <Button autoFocus variant="contained" color="primary" onClick={handleSave} disabled={!did || isSubmitting || !didMatches}>
        Sign Presentation
      </Button>
    </>
  );

  return (
    <Dialog title="Download Presentation" actions={actions} maxWidth="sm" {...props}>
      {presentation ? (
        <center>
          <br />
          <CheckIcon fontSize="large" />
          <br /><br />
          <Typography variant="h5" gutterBottom>
            Successfully created
          </Typography>
          <Typography gutterBottom>
            Now download and share your credential presentation.
          </Typography>
          <br /><br />
          <Button autoFocus variant="contained" color="primary" onClick={handleDownload} startIcon={<SaveAltIcon />}>
            Download
          </Button>
          <br /><br /><br />
        </center>
      ) : (
        <>
          <Typography>
            To sign and download a presentation for this credential, you need a DID. If the credential was issued to a specific DID, your DID must match the credential subject's DID.
          </Typography>
          <br />

          <DIDSelector
            disabled={isSubmitting}
            credential={credential}
            signTitle="Select holder DID"
            signMessage="Use your Decentralized Identifier (DID) to create and sign your presentation"
            emptyMessage="You need to add a DID in order to create and sign your presentation."
            onChange={setDID} />

          {did && !didMatches && (
            <MuiAlert severity="error">
              DID does not match the credential subject!
            </MuiAlert>
          )}
        </>
      )}
    </Dialog>
  );
}
