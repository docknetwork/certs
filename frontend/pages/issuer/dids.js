import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import dynamic from 'next/dynamic';

import { getSavedDIDs, removeDID } from '../../services/chain';
import AuthWrapper from '../../components/auth/wrapper';
import EmptyHero from '../../components/misc/hero';
import Table from '../../components/table';

const AddDIDModal = dynamic(() => import('../../components/modals/add-did'));

const headCells = [{
  id: 'id', numeric: false, disablePadding: true, label: 'Name',
}, {
  id: 'controller', numeric: false, disablePadding: false, label: 'Controller Address',
}];

export default function IssuerSettingsDIDs() {
  const [showAddAccount, setShowAddAcount] = useState(false);
  const accounts = getSavedDIDs();

  function handleShowAddAccount() {
    setShowAddAcount(true);
  }

  function handleCloseAddAccount() {
    setShowAddAcount(false);
  }

  function handleDelete(selected) {
    for (let i = 0; i < selected.length; i++) {
      const address = selected[i];
      removeDID(address);
    }
  }

  const tableHeaderAction = (
    <Button variant="contained" color="primary" onClick={handleShowAddAccount} style={{ marginLeft: 'auto' }}>
      Add DID
    </Button>
  );

  const emptyHeroActions = [(
    <Button key="adddid" variant="contained" color="primary" onClick={handleShowAddAccount} style={{ minWidth: '315px' }}>
      Add DID
    </Button>
  )];

  return (
    <AuthWrapper>
      {accounts && (
        accounts.length > 0 ? (
          <Table
            primaryId="id"
            headerAction={tableHeaderAction}
            rows={accounts}
            title="Saved DIDs"
            headers={headCells}
            onDelete={handleDelete} />
        ) : (
          <>
            <Typography variant="h5">Saved DIDs</Typography>
            <Box mt={3}>
              <Paper variant="outlined">
                <EmptyHero
                  title="No DIDs"
                  text="To issue credentials, you need a DID"
                  actions={emptyHeroActions} />
              </Paper>
            </Box>
          </>
        )
      )}

      <AddDIDModal onClose={handleCloseAddAccount} open={showAddAccount} />
    </AuthWrapper>
  );
}
