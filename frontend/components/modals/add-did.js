import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import MuiAlert from '@material-ui/lab/Alert';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';

import b58 from 'bs58';
import { u8aToHex } from '@polkadot/util';
import dock from '@docknetwork/sdk';
import { createNewDockDID } from '@docknetwork/sdk/utils/did';
import { getPublicKeyFromKeyringPair } from '@docknetwork/sdk/utils/misc';

import CachedIcon from '@material-ui/icons/Cached';
import AddIcon from '@material-ui/icons/Add';
import AddAccountModal from './add-account';

import useCustomSnackbar from '../../helpers/snackbar';
import {
  ensureConnection, ensureKeyring, registerNewDIDUsingPair,
} from '../../helpers/vc';
import { saveDID } from '../../services/chain';
import AccountSelector from '../account-selector';
import Dialog from '../dialog';

import SendTransactionModal from './send-transaction';

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

function decodePublicKey(pk) {
  return u8aToHex(b58.decode(pk.publicKeyBase58));
}

export function AddDIDForm({
  disabled, did, setDID, account, chainAccount, handleChangeAccount,
}) {
  const classes = useStyles();
  const [showAddAccount, setShowAddAccount] = useState(false);

  function handleChangeDID(e) {
    setDID(e.target.value);
  }

  function handleGenerateDID() {
    setDID(createNewDockDID());
  }

  async function handleCloseAddAccount(newChainAccount) {
    setShowAddAccount(false);
    if (newChainAccount) {
      const value = newChainAccount;
      if (value && value.seed) {
        await ensureKeyring();
        handleChangeAccount(value, dock.keyring.addFromUri(value.seed, null, value.type));
      }
    }
  }

  function handleShowAddAccount() {
    setShowAddAccount(true);
  }

  return (
    <>
      <Typography variant="h6" component="p" className={classes.formHeader}>
        1. Add DID Key

        <Button
          color="primary"
          component="a"
          disabled={disabled}
          onClick={handleGenerateDID}
          className={classes.generateButton}
          startIcon={<CachedIcon />}>
          Generate DID
        </Button>
      </Typography>

      <FormControl fullWidth className={classes.formControl}>
            <TextField
              id="name"
              label="DID"
              placeholder="did:dock:YOURDIDHERE"
              fullWidth
              disabled={disabled}
              variant="outlined"
              value={did}
              onChange={handleChangeDID}
              helperText="Use the above DID on the Dock testnet or add your own."
            />
      </FormControl>

      <Typography variant="h6" className={classes.formHeader}>
        2. Add controller keypair

        <Button
            color="primary"
            component="a"
            disabled={disabled}
            onClick={handleShowAddAccount}
            className={classes.generateButton}
            startIcon={<AddIcon />}>
          Add account
        </Button>
      </Typography>

      <AccountSelector
        title="Select or add controller keypair"
        helperText="This account will be able to make changes to or remove the above DID."
        key={account && account.address}
        disabled={disabled}
        successText="Controller account created"
        setAccount={handleChangeAccount}
        account={chainAccount} />

      <AddAccountModal open={showAddAccount} onClose={handleCloseAddAccount} successText="Controller account created" />
    </>
  );
}

export async function handleSave({
  did, account, snackbar, setIsSubmitting, setError, setTransaction, handleAddDID, chainAccount,
}) {
  setIsSubmitting(true);
  setError(null);

  snackbar.showSuccess('Checking to see if DID exists...');

  // Ensure we're connected to the node
  await ensureConnection();

  // Check if DID already exists
  try {
    const document = await dock.did.getDocument(did);

    for (let i = 0; i < document.publicKey.length; i++) {
      const publicKey = document.publicKey[i];
      const documentPK = decodePublicKey(publicKey);
      const myControllerPk = getPublicKeyFromKeyringPair(account);

      // Ensure account PK matches public documents PK
      if (documentPK === myControllerPk.value) {
        saveDID(did, chainAccount.address);
        handleAddDID(did, document);
        setIsSubmitting(false);
        return;
      }
    }

    throw new Error('The controller you entered does not own this DID!');
  } catch (e) {
    if (e.toString().indexOf('NoDIDError') === -1) {
      setError(e.toString());
      setIsSubmitting(false);
      return;
    }
  }

  snackbar.showSuccess('Registering DID...');

  // DID doesnt exist, lets try to register
  const tx = async () => {
    try {
      const result = await registerNewDIDUsingPair(did, account);

      let didSucceed = false;
      result.events.forEach(({ event: { method } }) => {
        if (method === 'DidAdded') {
          didSucceed = true;
        }
      });

      if (didSucceed) {
        const document = await dock.did.getDocument(did);
        saveDID(did, chainAccount.address);
        handleAddDID(did, document);
      } else {
        throw new Error('Unable to register DID, transaction failed. Perhaps it already exists?');
      }
    } catch (e) {
      setError(e.toString());
      snackbar.showError('Unable to register DID!');
    }

    setIsSubmitting(false);
    setTransaction(null);
  };
  setTransaction(() => tx);
}

export default function AddDIDModal(props) {
  const snackbar = useCustomSnackbar();
  const [account, setAccount] = useState();
  const [chainAccount, setChainAccount] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [did, setDID] = useState(createNewDockDID());
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState();

  function handleCloseSendTx(txAccount) {
    setTransaction(null);
    if (!txAccount) {
      setIsSubmitting(null);
    }
  }

  function handleAddDID(newDID) {
    if (props.onClose) {
      props.onClose(newDID, account.address);
    }
    snackbar.showSuccess(`DID has been added: ${newDID}`);
  }

  function handleChangeAccount(newChainAccount, dockAccount) {
    setChainAccount(newChainAccount);
    setAccount(dockAccount);
  }

  function handleAddSaveDID() {
    handleSave({
      did,
      account,
      snackbar,
      setIsSubmitting,
      setError,
      setTransaction,
      handleAddDID,
      chainAccount,
    });
  }

  const actions = (
    <>
      <Button onClick={props.onClose}>
        Cancel
      </Button>
      <Button autoFocus color="primary" onClick={handleAddSaveDID} disabled={!account || isSubmitting}>
        Add DID
      </Button>
    </>
  );

  return (
    <Dialog title={'Add DID'} actions={actions} maxWidth="md" {...props}>
      <Typography>
        To issue credentials, a verifier must be able to identify the issuer somehow. In VCDM, the issuer is defined through a decentralized identifier in the credential.
        You can create a new DID on the Dock testnet with this form, or import your own.
      </Typography>

      <AddDIDForm {...{
        did, setDID, account, chainAccount, handleChangeAccount,
      }} />

      {error && (
        <MuiAlert severity="error">
          {error}
        </MuiAlert>
      )}

      <SendTransactionModal onClose={handleCloseSendTx} transaction={transaction} open={!!transaction} />
    </Dialog>
  );
}
