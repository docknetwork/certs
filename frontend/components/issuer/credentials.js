import VisibilityIcon from '@material-ui/icons/Visibility';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import Table from '../table';
import EmptyHero from '../misc/hero';
import { getCredentials } from '../../services/user';

const IssueModal = dynamic(() => import('../../components/modals/issue'));
const AddTemplateModal = dynamic(() => import('../../components/modals/add-template'));
const CredentialModal = dynamic(() => import('../../components/modals/credential'));

const headCells = [{
  id: 'name', numeric: false, disablePadding: false, label: 'Recipient name',
},
{
  id: 'id', numeric: false, disablePadding: false, label: 'ID',
},
{
  id: 'reference', numeric: false, disablePadding: false, label: 'Recipient ID',
},
{
  id: 'template', numeric: false, disablePadding: false, label: 'Template',
},
{
  id: 'created', numeric: false, disablePadding: false, label: 'Date',
}];

function credentialToData(credential) {
  const { receiver } = credential;
  return {
    id: credential._id,
    template: credential.template ? credential.template.name : 'Deleted',
    name: receiver && receiver.name,
    reference: receiver && receiver.reference,
    created: credential.created,
  };
}

export default function IssuerCredentials({ totals, loadTotals }) {
  const [state, setState] = useState({});
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showCredential, setShowCredential] = useState(false);

  const actions = [{
    icon: (
      <VisibilityIcon />
    ),
    label: 'View',
    onClick(row) {
      setShowCredential(row.id);
      // Router.push(`/credential/${row.id}`);
    },
  }];

  async function loadCredentials() {
    const credentials = await getCredentials();
    if (credentials.length > 0) {
      const rows = credentials.map(credentialToData);

      setState({
        ...state,
        credentials: rows,
      });
    } else {
      setState({ credentials: [] });
    }
  }

  function handleCloseCredential() {
    setShowCredential(false);
  }

  function handleShowIssue() {
    setShowIssueModal(true);
  }

  function handleCloseIssue(credential) {
    setShowIssueModal(false);
    if (credential && credential._id) {
      loadTotals();
      state.credentials.unshift(credentialToData(credential));
      setState({
        ...state,
        credentials: state.credentials,
      });
    }
  }

  function handleShowTemplate() {
    setShowTemplate(true);
  }

  function handleCloseTemplate(template) {
    setShowTemplate(false);
    if (template && template._id) {
      loadTotals();
    }
  }

  useEffect(() => {
    loadCredentials();
  }, []);

  const emptyActions = [(
    <Button key="issuecred" variant="contained" color="primary" onClick={handleShowIssue} style={{ minWidth: '315px' }}>
      Issue Credential
    </Button>
  )];

  const tableHeaderAction = (
    <Button key="issuecred" variant="contained" color="primary" onClick={handleShowIssue} style={{ marginLeft: 'auto' }}>
      Issue Credential
    </Button>
  );

  const templateActions = [(
    <Button key="addtemplate" variant="contained" color="primary" onClick={handleShowTemplate} style={{ minWidth: '315px' }}>
      Add Template
    </Button>
  )];

  return (
    state.credentials && (
      totals.credentials > 0 ? (
        <>
          <Table headerAction={tableHeaderAction} rows={state.credentials} title="Credentials" actions={actions} headers={headCells} />
          <IssueModal onClose={handleCloseIssue} open={showIssueModal} />
          <CredentialModal key={showCredential} credentialId={showCredential} onClose={handleCloseCredential} open={!!showCredential} />
        </>
      ) : (
        <>
          <Typography variant="h5">Credentials</Typography>
          <Box mt={3}>
            <Paper variant="outlined">
              {totals.templates > 0 ? (
                <EmptyHero
                  title="No credentials"
                  text=""
                  actions={emptyActions} />
              ) : (
                <EmptyHero
                  title="Start issuing credentials"
                  text="First, let’s create a credential template"
                  actions={templateActions} />
              )}
            </Paper>
          </Box>
          <AddTemplateModal onClose={handleCloseTemplate} open={showTemplate} />
          {totals.templates > 0 && (
            <IssueModal onClose={handleCloseIssue} open={showIssueModal} />
          )}
        </>
      )
    )
  ) || (
    <></>
  );
}
