import React, { useState, useEffect } from 'react';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import AssignmentOutlinedIcon from '@material-ui/icons/AssignmentOutlined';
import AssignmentIndOutlinedIcon from '@material-ui/icons/AssignmentIndOutlined';
import ClassOutlinedIcon from '@material-ui/icons/ClassOutlined';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import AuthWrapper from '../../components/auth/wrapper';
import { getTotals } from '../../services/user';

const IssuerCredentials = dynamic(() => import('../../components/issuer/credentials'));

const useStyles = makeStyles(() => ({
  cardInner: {
    display: 'flex',
    flexDirection: 'column',
    color: '#ffffff',
  },
  icon: {
    width: '120px',
    height: '120px',
    marginLeft: 'auto',
    color: '#ffffff',
  },
  primaryPaper: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 0 0 20px',
    backgroundColor: '#1B76E9',
    cursor: 'pointer',
    height: '180px',
    borderRadius: 8,
  },
  boxTitle: {
    marginTop: '-15px',
  },
}));

function DashHeaderBox({
  href, count, title, secondary = false,
}) {
  const classes = useStyles();
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Link href={href}>
        <Paper elevation={0} className={classes.primaryPaper} style={{
          backgroundColor: secondary ? '#5FBFF7' : '#1B76E9',
        }}>
          <div className={classes.cardInner}>
            <Typography variant="h1" className={classes.boxTitle}>
              {count || 0}
            </Typography>
            <Typography variant="h5">
              {title}
            </Typography>
          </div>
        </Paper>
      </Link>
    </Grid>
  );
}

function DashHeader({ totals }) {
  return (
      <Grid container spacing={4}>
        <DashHeaderBox href="/issuer/credentials" count={totals.credentials} title="Credentials" icon={AssignmentOutlinedIcon} />
        <DashHeaderBox href="/issuer/receivers" count={totals.receivers} title="Recipients" secondary icon={AssignmentIndOutlinedIcon} />
        <DashHeaderBox href="/issuer/templates" count={totals.templates} title="Templates" icon={ClassOutlinedIcon} />
      </Grid>
  );
}

export default function IssuerDashboard({ user }) {
  const [totals, setTotals] = useState();

  async function loadTotals() {
    const total = await getTotals();
    setTotals(total);
  }

  useEffect(() => {
    loadTotals();
  }, []);

  return (
    <AuthWrapper showLoad={!user || !totals}>
      <DashHeader totals={totals} />
      <br />
      <br />
      <IssuerCredentials totals={totals} loadTotals={loadTotals} />
    </AuthWrapper>
  );
}
