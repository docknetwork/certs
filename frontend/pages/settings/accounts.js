import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

import { getChainAccounts, removeChainAccount } from '../../services/chain';
import { UnauthWrapper } from '../../components/auth/wrapper';
import EmptyHero from '../../components/misc/hero';
import Table from '../../components/table';

const AddAccountModal = dynamic(() => import('../../components/modals/add-account'));
const AlertDialog = dynamic(() => import('../../components/alert-dialog'));

const headCells = [{
  id: 'name', numeric: false, disablePadding: true, label: 'Name',
}, {
  id: 'address', numeric: false, disablePadding: false, label: 'Address',
}, {
  id: 'type', numeric: false, disablePadding: false, label: 'Seed Type',
}];

export default function IssuerSettingsAccounts() {
  const [showAddAccount, setShowAddAcount] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selected, setSelected] = useState([]);
  const accounts = getChainAccounts();

  function handleShowAddAccount() {
    setShowAddAcount(true);
  }

  function handleCloseAddAccount() {
    setShowAddAcount(false);
  }

  function handleDelete(delSelected) {
    setShowConfirmDialog(true);
    setSelected(delSelected);
  }

  function handleCloseConfirmDialog(proceed) {
    setShowConfirmDialog(false);
    if (proceed) {
      for (let i = 0; i < selected.length; i++) {
        const address = selected[i];
        removeChainAccount(address);
      }
    }
  }

  const tableHeaderAction = (
    <Button variant="contained" color="primary" onClick={handleShowAddAccount} style={{ marginLeft: 'auto' }}>
      Add Account
    </Button>
  );

  const emptyHeroActions = [(
    <Button key="addaccount" variant="contained" color="primary" onClick={handleShowAddAccount} style={{ minWidth: '315px' }}>
      Add Account
    </Button>
  )];

  return (
    <UnauthWrapper>
      {accounts && (
        accounts.length > 0 ? (
          <Table
            primaryId="address"
            headerAction={tableHeaderAction}
            rows={accounts}
            title="Saved Accounts"
            headers={headCells}
            onDelete={handleDelete} />
        ) : (
          <>
            <Typography variant="h5">Saved Accounts</Typography>
            <Box mt={3}>
              <Paper variant="outlined">
                <EmptyHero
                  title="No accounts"
                  text="To write to the blockchain or sign with a DID, you need to create an account"
                  actions={emptyHeroActions} />
              </Paper>
            </Box>
          </>
        )
      )}

      <AddAccountModal onClose={handleCloseAddAccount} open={showAddAccount} />
      <AlertDialog
        title="Delete these accounts?"
        message="Before deleting your accounts, please make sure have them backed up for restoration if you wish to use them in the future. Any new accounts added must have balance to send transactions."
        open={showConfirmDialog}
        onClose={handleCloseConfirmDialog} />
    </UnauthWrapper>
  );
}
