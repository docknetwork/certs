import React, { useState } from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';

import downloadJSON from '../../helpers/download-json';
import Credential from '../credential';
import Dialog from '../dialog';

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
}) {
  const classes = useStyles();
  const [vc, setVC] = useState();

  function handleDownload() {
    downloadJSON(vc, credentialId);
  }

  const modalHeader = (
    <div className={classes.headerWrapper}>
      <IconButton aria-label="back" onClick={onClose} className={classes.headerBtn}>
        <ArrowBackIcon />
      </IconButton>
      {vc && (
        <IconButton aria-label="save" onClick={handleDownload} className={classes.headerBtn} style={{ marginLeft: 'auto' }}>
          <SaveAltIcon />
        </IconButton>
      )}
    </div>
  );

  return (
    <Dialog title={modalHeader} maxWidth="xl" fullScreenBreakpoint="xl" contentProps={{ style: { padding: 0 } }} open={open}>
      <Credential key={credentialId} id={credentialId || (credential && credential._id)} cachedCredential={credential} setVC={setVC} />
    </Dialog>
  );
}
