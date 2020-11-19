import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';

import useCustomSnackbar from '../../helpers/snackbar';
import { saveChainAccount } from '../../services/chain';
import KeypairEditor from '../keypair-editor';
import Dialog from '../dialog';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(1),
  },
  fullWidth: {
    width: '100%',
  },
  generateButton: {
    width: '100%',
    marginTop: '8px',
    height: '40px',
  },
}));

export default function AddAccountModal(props) {
  const classes = useStyles();
  const snackbar = useCustomSnackbar();
  const [account, setAccount] = useState();
  const [chainAccount, setChainAccount] = useState();
  const [accountName, setAccountName] = useState('');
  const title = props.title || 'Add account';

  function handleChangeName(e) {
    setAccountName(e.target.value);
  }

  function handleChangeAccount(newAccount, newChainAccount) {
    setAccount(newAccount);
    setChainAccount(newChainAccount);
  }

  async function handleSave() {
    saveChainAccount(account.address, chainAccount.seed, chainAccount.type, accountName);
    if (props.onClose) {
      props.onClose(account);
    }
    snackbar.showSuccess(props.successText || 'Account has been saved!');
  }

  const actions = (
    <>
      <Button onClick={() => props.onClose()}>
        Cancel
      </Button>
      <Button autoFocus variant="contained" color="primary" onClick={handleSave} disabled={!chainAccount || !account}>
        Add Account
      </Button>
    </>
  );

  return (
    <Dialog title={`${title}: ${account && account.address}`} actions={actions} maxWidth="md" {...props}>
      <Typography>
        To sign and submit transactions on the chain, you must have a valid account with a balance of DOCK tokens.<br />

        Add an existing account or generate one to receive balance through our testnet faucet.
      </Typography>
      <br />

      <FormControl fullWidth className={classes.formControl}>
        <TextField
          id="name"
          label="Account name"
          fullWidth
          variant="outlined"
          value={accountName}
          onChange={handleChangeName}
        />
      </FormControl>

      <br /><br />

      <KeypairEditor title="Account" {...{ account, setAccount: handleChangeAccount }} />
    </Dialog>
  );
}
