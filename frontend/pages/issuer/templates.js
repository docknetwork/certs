import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import AuthWrapper from '../../components/auth/wrapper';
import Table from '../../components/table';
import { getTemplates } from '../../services/user';
import EmptyHero from '../../components/misc/hero';

const AddTemplateModal = dynamic(() => import('../../components/modals/add-template'));

function templateToRow(template) {
  return {
    id: template._id,
    ...template,
  };
}

const headCells = [
  {
    id: 'name', numeric: false, disablePadding: false, label: 'Name',
  },
  {
    id: 'id', numeric: false, disablePadding: false, label: 'ID',
  },
  {
    id: 'created', numeric: false, disablePadding: false, label: 'Created',
  },
  // {
  //   id: 'actions', numeric: false, disablePadding: false, label: 'Actions',
  // },
];

export default function IssuerTemplates() {
  const [state, setState] = useState({});
  const [showTemplate, setShowTemplate] = useState(false);

  async function loadTemplates() {
    const templates = await getTemplates();
    const rows = templates.map(templateToRow);

    setState({
      ...state,
      templates: rows,
    });
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  function handleShowTemplate() {
    setShowTemplate(true);
  }

  function handleCloseTemplate(template) {
    setShowTemplate(false);
    if (template && template._id) {
      loadTemplates();
    }
  }

  const actions = [{
    icon: (
      <EditIcon />
    ),
    label: 'Edit',
    onClick(row) {
      // TODO: open template editor
    },
  }/*, {
    icon: (
      <CardMembershipIcon />
    ),
    label: 'Issue with template',
    onClick(row) {
      // TODO
    },
  }*/];

  const tableHeaderAction = (
    <Button variant="contained" color="primary" onClick={handleShowTemplate} style={{ marginLeft: 'auto' }}>
      Add Template
    </Button>
  );

  const emptyHeroActions = [(
    <Button key="addtemplate" variant="contained" color="primary" onClick={handleShowTemplate} style={{ minWidth: '315px' }}>
      Add Template
    </Button>
  )];

  return (
    <AuthWrapper showLoad={!state.templates}>
      {state.templates && (
        state.templates.length > 0 ? (
          <Table actions={actions} headerAction={tableHeaderAction} rows={state.templates} title="Templates" headers={headCells} />
        ) : (
          <>
            <Typography variant="h5">Templates</Typography>
            <Box mt={3}>
              <Paper variant="outlined">
                <EmptyHero
                  title="No Templates"
                  text="To issue credentials, you need a template"
                  actions={emptyHeroActions} />
              </Paper>
            </Box>
          </>
        )
      )}

      <AddTemplateModal onClose={handleCloseTemplate} open={showTemplate} />
    </AuthWrapper>
  );
}
