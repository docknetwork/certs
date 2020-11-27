import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import Credential from '../../components/credential';
import downloadJSON from '../../helpers/download-json';

const CreatePresentationModal = dynamic(() => import('../../components/modals/create-presentation'));

// TODO: render this page server side so that we dont expose json to everyone
export default function CredentialPage() {
  const router = useRouter();
  const [vc, setVC] = useState();
  const [showCreatePresentation, setShowCreatePresentation] = useState(false);
  const { id } = router.query;

  function handleDownload() {
    downloadJSON(vc, id);
  }

  function handleCreatePresentation() {
    setShowCreatePresentation(true);
  }

  function handleClosePresentation() {
    setShowCreatePresentation(false);
  }

  return (
    <>
      <AppBar position="fixed" color="#ffffff" style={{ zIndex: 100, boxShadow: 'none', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
        <Toolbar>
          <Link href="/" passHref>
            <a>
              <img style={{ margin: 0 }} width="103px" height="26px" src={'/static/img/certs-logo.svg'} />
            </a>
          </Link>
          {vc && (
            <>
              <Button variant="contained" color="primary" style={{ marginLeft: 'auto' }} onClick={handleCreatePresentation}>
                Create Presentation
              </Button>
              <IconButton aria-label="save" onClick={handleDownload} style={{ marginLeft: '10px' }}>
                <SaveAltIcon />
              </IconButton>

              <CreatePresentationModal id={id} credential={vc} open={showCreatePresentation} onClose={handleClosePresentation} />
            </>
          )}
        </Toolbar>
      </AppBar>
      <Credential id={id} setVC={setVC} />
    </>
  );
}
