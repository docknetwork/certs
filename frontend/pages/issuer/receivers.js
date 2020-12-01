import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
// import CardMembershipIcon from '@material-ui/icons/CardMembership';
import EditIcon from '@material-ui/icons/Edit';
import dynamic from 'next/dynamic';

import EmptyHero from '../../components/misc/hero';
import AuthWrapper from '../../components/auth/wrapper';
import Table from '../../components/table';
import { getReceivers, deleteReceivers } from '../../services/user';

const IssueModal = dynamic(() => import('../../components/modals/issue'));
const EditReceiverModal = dynamic(() => import('../../components/modals/edit-receiver'));
const AlertDialog = dynamic(() => import('../../components/alert-dialog'));

const headCells = [{
  id: 'name', numeric: false, disablePadding: true, label: 'Recipient name',
},
{
  id: 'email', numeric: false, disablePadding: false, label: 'Email',
},
{
  id: 'did', numeric: false, disablePadding: false, label: 'DID',
},
{
  id: 'created', numeric: false, disablePadding: false, label: 'Created Date',
}];

export default function IssuerRecipients() {
  const [state, setState] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [issueDefaultReceiver, setIssueDefaultReceiver] = useState();

  async function loadRecipients() {
    const recipients = await getReceivers();
    setState({
      ...state,
      recipients,
    });
  }

  useEffect(() => {
    loadRecipients();
  }, []);

  function handleShowIssue() {
    setShowIssueModal(true);
  }

  function handleCloseEdit(receiver) {
    setShowEditModal(false);
    setIssueDefaultReceiver(null);

    if (receiver && receiver._id) {
      loadRecipients();
    }
  }

  function handleCloseIssue(credential) {
    setShowIssueModal(false);
    setIssueDefaultReceiver(null);
    if (credential && credential._id) {
      loadRecipients();
    }
  }

  function handleDelete(delSelected) {
    setShowConfirmDialog(true);
    setSelected(delSelected);
  }

  async function handleCloseConfirmDialog(proceed) {
    setShowConfirmDialog(false);
    if (proceed) {
      await deleteReceivers(selected);
      loadRecipients();
    }
  }

  const actions = [{
    icon: (
      <EditIcon />
    ),
    label: 'Edit',
    onClick(row) {
      setIssueDefaultReceiver(row);
      setShowEditModal(true);
    },
  }/*, {
    icon: (
      <CardMembershipIcon />
    ),
    label: 'Issue to receiver',
    onClick(row) {
      setIssueDefaultReceiver(row);
      setShowIssueModal(true);
    },
  }*/];

  const issueText = (
    <>
      Recipients are added here when you{' '}
      <a style={{ color: '#1B76E9', textDecoration: 'none', cursor: 'pointer' }} onClick={handleShowIssue}>
        issue a credential
      </a>
    </>
  );

  const defaultReceiverId = issueDefaultReceiver && issueDefaultReceiver._id;

  return (
    <AuthWrapper showLoad={!state.recipients}>
      {state.recipients && (
        state.recipients.length > 0 ? (
          <>
            <Table primaryId={'_id'} actions={actions} rows={state.recipients} title="Recipients" headers={headCells} onDelete={handleDelete} />
            <IssueModal key={`issue${defaultReceiverId}`} receiver={defaultReceiverId} onClose={handleCloseIssue} open={showIssueModal} />
            <EditReceiverModal key={`edit${defaultReceiverId}`} receiver={issueDefaultReceiver} onClose={handleCloseEdit} open={showEditModal} />
            <AlertDialog
              title="Delete these recipients?"
              message="You will no longer be able to issue credentials to these recipients."
              open={showConfirmDialog}
              onClose={handleCloseConfirmDialog} />
          </>
        ) : (
          <>
            <Typography variant="h5">Recipients</Typography>
            <Box mt={3}>
              <Paper variant="outlined">
                <EmptyHero
                  title="No recipients"
                  text={issueText} />
              </Paper>
            </Box>

            <IssueModal onClose={handleCloseIssue} open={showIssueModal} />
          </>
        )
      )}
    </AuthWrapper>
  );
}
