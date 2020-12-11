import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { useRouter } from 'next/router';
import Link from 'next/link';

import Credential from '../../components/credential';

// TODO: render this page server side so that we dont expose json to everyone
export default function CredentialPage() {
  const router = useRouter();
  const { id } = router.query;
  return (
    <>
      <AppBar position="fixed" color="#ffffff" style={{ zIndex: 100, boxShadow: 'none', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
        <Toolbar>
          <Link href="/" passHref>
            <a>
              <img style={{ margin: 0 }} width="103px" height="26px" src={'/static/img/certs-logo.svg'} />
            </a>
          </Link>
        </Toolbar>
      </AppBar>
      <Credential id={id} showJSON={false} />
    </>
  );
}
