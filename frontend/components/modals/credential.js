import React, { useState } from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import dynamic from 'next/dynamic';

import Credential from '../credential';
import Dialog from '../dialog';

const CreatePresentationModal = dynamic(() => import('./create-presentation'));

const useStyles = makeStyles((theme) => ({
  headerWrapper: {
    display: 'flex',
    width: '100%',
    paddingRight: theme.spacing(1),
    boxSizing: 'border-box',
  },
  headerBtn: {
    padding: '6px',
  },
}));

export default function CredentialModal({
  open = true, credentialId, credential, onClose,
  canCreatePresentation = false,
}) {
  const classes = useStyles();
  const [vc, setVC] = useState();
  const [showCreatePresentation, setShowCreatePresentation] = useState(false);

  function handleCreatePresentation() {
    setShowCreatePresentation(true);
  }

  function handleClosePresentation() {
    setShowCreatePresentation(false);
  }

  const modalHeader = (
    <div className={classes.headerWrapper}>
      <IconButton aria-label="back" onClick={onClose} className={classes.headerBtn}>
        <ArrowBackIcon />
      </IconButton>
      {vc && (
        <>
          {canCreatePresentation && (
            <Tooltip title="Download Presentation">
              <IconButton aria-label="save" onClick={handleCreatePresentation} className={classes.headerBtn} style={{ marginLeft: 'auto' }}>
                <SaveAltIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );

  return (
    <Dialog title={modalHeader} maxWidth="xl" fullScreenBreakpoint="xl" contentProps={{ style: { padding: 0 } }} open={open}>
      <Credential key={credentialId} id={credentialId || (credential && credential._id)} cachedCredential={credential} setVC={setVC} />
      {credential && (
        <CreatePresentationModal id={credential._id} credential={vc} open={showCreatePresentation} onClose={handleClosePresentation} />
      )}
    </Dialog>
  );
}
