import React, { useState, useEffect } from 'react';

import IssuerCredentials from '../../components/issuer/credentials';
import AuthWrapper from '../../components/auth/wrapper';
import { getTotals } from '../../services/user';

export default function IssuerCredentialsPage() {
  const [totals, setTotals] = useState();

  async function loadTotals() {
    const total = await getTotals();
    setTotals(total);
  }

  useEffect(() => {
    loadTotals();
  }, []);

  return (
    <AuthWrapper showLoad={!totals}>
      <IssuerCredentials totals={totals} loadTotals={loadTotals} />
    </AuthWrapper>
  );
}
