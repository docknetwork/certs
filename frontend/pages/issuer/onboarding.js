import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import Router from 'next/router';
import dock from '@docknetwork/sdk';

import { createNewDockDID } from '@docknetwork/sdk/utils/did';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { randomAsHex } from '@polkadot/util-crypto';

import { AddDIDForm, handleSave } from '../../components/modals/add-did';
import SendTransactionModal from '../../components/modals/send-transaction';
import useCustomSnackbar from '../../helpers/snackbar';
import { apiPost } from '../../services/api';

import { saveChainAccount, saveDID } from '../../services/chain';
import {
  ensureConnection, registerNewDIDUsingPair,
} from '../../helpers/vc';

const useStyles = makeStyles((theme) => ({
  signinRoot: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(10),
  },
  signinPaperWrapper: {
    width: '100%',
    maxWidth: '400px',
    height: '470px',
  },
  didPaperWrapper: {
    width: '100%',
    maxWidth: '630px',
  },
  form: {
    margin: theme.spacing(4, 4),
    display: 'flex',
    flexDirection: 'column',
  },
  formControl: {
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  flexed: {
    display: 'flex',
    marginTop: theme.spacing(3),
  },
  buttonRight: {
    marginLeft: 'auto',
    maxWidth: '80px',
    marginRight: theme.spacing(2),
    opacity: 0.5,
  },
  buttonFixed: {
    maxWidth: '160px',
  },
}));

const sectors = ['Education', 'Enterprise Systems', 'Financial', 'Government', 'Health Care', 'HR / Workforce', 'Information Technology', 'Licensing', 'Supply Chain', 'Other'];

const nodeAddress = process.env.NEXT_PUBLIC_WSS_NODE_ADDR;

function AccountGenerator() {
  const classes = useStyles();
  const snackbar = useCustomSnackbar();
  const [state, setState] = useState(0);
  const stateLabels = ['Creating your account', 'Requesting blockchain balance', 'Registering your new Decentralized Identifier (DID)'];

  async function requestBalance(account) {
    // Send request to faucet
    try {
      await apiPost('faucet', { address: account.address, nodeAddress });
    } catch (e) {
      snackbar.showError('There was an error requesting balance, trying again in 10s...');
      setTimeout(() => {
        requestBalance(account);
      }, 10000);
      return;
    }
    dock.setAccount(account);

    // Double check account has balance
    let hasBalance = false;
    const accountData = await dock.api.query.system.account(account.address);
    hasBalance = accountData.data.free > 0;

    if (hasBalance) {
      setState(2);
      const did = createNewDockDID();

      try {
        const result = await registerNewDIDUsingPair(did, account);

        let didSucceed = false;
        result.events.forEach(({ event: { method } }) => {
          if (method === 'DidAdded') {
            didSucceed = true;
          }
        });

        if (didSucceed) {
          saveDID(did, account.address);
          Router.push('/issuer');
        } else {
          snackbar.showError('Unable to register DID, transaction failed. Perhaps it already exists?');
        }
      } catch (e) {
        snackbar.showError(e.toString());
      }
    } else {
      snackbar.showError('Generated account has no balance, please contact support.');
    }
  }

  async function generateAccount() {
    // Generate new account
    await ensureConnection();
    const seed = randomAsHex(32);
    const type = 'sr25519';
    const account = dock.keyring.addFromUri(seed, null, type);
    saveChainAccount(account.address, seed, type, 'Certs Account');
    setState(1);
    requestBalance(account);
  }

  useEffect(() => {
    generateAccount();
  }, []);

  return (
    <Paper elevation={1} className={classes.signinPaperWrapper}>
      <div className={classes.form}>
        <Box m={4} mt={10}>
          <center>
            {state < 3 ? (
              <CircularProgress size={50} />
            ) : (
              <CheckCircleIcon color="primary" style={{ width: '60px', height: '60px' }} />
            )}
          </center>
        </Box>

        <Box mt={4}>
          <center>
            <Typography variant="h5">
              {stateLabels[state]}
            </Typography>
          </center>
        </Box>
      </div>
    </Paper>
  );
}

export default function IssuerOnboarding() {
  const classes = useStyles();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [sector, setSector] = useState('');
  const [activeStep, setStep] = useState(0);
  const [account, setAccount] = useState();
  const [chainAccount, setChainAccount] = useState();
  const [did, setDID] = useState(createNewDockDID());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState();
  const snackbar = useCustomSnackbar();
  const autoGenerate = true; // TODO: testnet only

  function handleChangeSector(e) {
    setSector(e.target.value);
  }

  function handleChangeName(e) {
    setName(e.target.value);
  }

  function handleChangeCompany(e) {
    setCompany(e.target.value);
  }

  function handleChangeRole(e) {
    setRole(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setStep(1);
    apiPost('user', {
      name,
      entityName: company,
      sector,
      role,
    });
  }

  const accountDetails = (
    <Paper elevation={1} className={classes.signinPaperWrapper}>
      <form className={classes.form} noValidate onSubmit={handleSubmit}>
        <Typography variant="h5">
          Add your account details
        </Typography>
        <br />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          label="Name"
          name="name"
          autoComplete="name"
          autoFocus
          value={name}
          onChange={handleChangeName}
          required
          className={classes.formControl}
        />

        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="company"
          label="Company"
          name="company"
          autoComplete="company"
          value={company}
          onChange={handleChangeCompany}
          required
          className={classes.formControl}
        />

        <FormControl variant="outlined" fullWidth className={classes.formControl}>
         <InputLabel id="sector-select-label">
           Sector *
         </InputLabel>
         <Select
            labelId="sector-select-label"
            id="sector-select"
            label="Sector *"
            fullWidth
            variant="outlined"
            value={sector}
            onChange={handleChangeSector}
            required
          >
            {sectors.map((value) => (
              <MenuItem value={value} key={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="role"
          label="Role"
          name="role"
          autoComplete="role"
          value={role}
          onChange={handleChangeRole}
          required
          className={classes.formControl}
        />

        <Button
          size="large"
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          disabled={!name || !sector || !company}
        >
          Continue
        </Button>
      </form>
    </Paper>
  );

  const accountGeneration = (
    <AccountGenerator />
  );

  function handleChangeAccount(newChainAccount, dockAccount) {
    setChainAccount(newChainAccount);
    setAccount(dockAccount);
  }

  function handleFinishOnboarding() {
    Router.push('/issuer');
  }

  function handleAddDID(newDid) {
    handleFinishOnboarding();
    snackbar.showSuccess(`DID has been added: ${newDid}`);
  }

  function handleRegisterDID(e) {
    e.preventDefault();
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

  function handleCloseSendTx(txAccount) {
    setTransaction(null);
    if (!txAccount) {
      setIsSubmitting(null);
    }
  }

  const registerDID = (
    <Paper elevation={1} className={classes.didPaperWrapper}>
      <form className={classes.form} noValidate>
        <Typography variant="h5" gutterBottom>
          Set up a decentralized identifier (DID)
        </Typography>
        <Typography variant="body1">
          This will be used as your identifier when issuing credentials.
        </Typography>
        <br />

        <AddDIDForm {...{
          did, setDID, account, chainAccount, handleChangeAccount,
        }} />

        <br />

        {error && (
          <MuiAlert severity="error">
            {error}
          </MuiAlert>
        )}

        <div className={classes.flexed}>
          <Button
            component="a"
            className={classes.buttonRight}
            onClick={handleFinishOnboarding}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting || !account || !chainAccount || !did}
            className={classes.buttonFixed}
            onClick={handleRegisterDID}
          >
            Continue
          </Button>
        </div>
      </form>

      <SendTransactionModal onClose={handleCloseSendTx} transaction={transaction} open={!!transaction} />
    </Paper>
  );

  return (
    <div className={classes.signinRoot}>
      {activeStep === 0 ? accountDetails : (autoGenerate ? accountGeneration : registerDID)}
    </div>
  );
}
