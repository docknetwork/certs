import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import IconButton from '@material-ui/core/IconButton';
import { useRouter } from 'next/router';
import Link from 'next/link';

import Credential from '../../components/credential';
import downloadJSON from '../../helpers/download-json';

export default function CredentialPage() {
  const router = useRouter();
  const [vc, setVC] = useState();
  const { id } = router.query;

  function handleDownload() {
    downloadJSON(vc, id);
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
            <IconButton aria-label="save" onClick={handleDownload} style={{ marginLeft: 'auto' }}>
              <SaveAltIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Credential id={id} setVC={setVC} />
    </>
  );
}
