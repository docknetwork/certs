import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import MuiAlert from '@material-ui/lab/Alert';
import dock from '@docknetwork/sdk';

import { ensureConnection } from '../../helpers/vc';
import useCustomSnackbar from '../../helpers/snackbar';
import AccountSelector from '../account-selector';
import Dialog from '../dialog';

export default function SendTransactionModal({ open = true, onClose, transaction }) {
  const [transactionAccount, setTransactionAccount] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);
  const snackbar = useCustomSnackbar();

  function handleClose() {
    onClose();
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    snackbar.showWarning('Submitting transaction...');
    const dockAccount = dock.keyring.addFromUri(transactionAccount.seed, null, transactionAccount.type);
    dock.setAccount(dockAccount);

    try {
      const result = await transaction(dockAccount);
      onClose(dockAccount, result);
    } catch (e) {
      onClose();
    }
    setIsSubmitting(false);
  }

  async function getBalance() {
    await ensureConnection();
    const accountData = await dock.api.query.system.account(transactionAccount.address);
    setBalance(accountData.data.free);
  }

  useEffect(() => {
    if (transactionAccount) {
      getBalance();
    }
  }, [transactionAccount]);

  const actions = (
    <>
      <Button onClick={handleClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button onClick={handleSubmit} color="primary" variant="contained" disabled={!transactionAccount || isSubmitting} autoFocus>
        Send Transaction
      </Button>
    </>
  );

  return (
    <Dialog
        open={open}
        onClose={handleClose}
        title="Send transaction to the chain?"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        actions={actions}
      >
      <AccountSelector
        key={transactionAccount && transactionAccount.address}
        disabled={isSubmitting}
        allowAddNew
        {...{ account: transactionAccount, setAccount: setTransactionAccount }}
        />
      {/* TODO: show estimate fees */}

      {(transactionAccount && balance <= 10000) && (
        <MuiAlert severity="warning" style={{ marginTop: '10px' }}>
          This account has low/no balance. Please <a href="https://faucet.dock.io" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>request some balance</a> from our testnet faucet otherwise you may get errors.
        </MuiAlert>
      )}

    </Dialog>
  );
}
