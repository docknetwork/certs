import React, { useState, useEffect } from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';

import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import { useAuthed } from '../../helpers/auth';
import { saveTemplate } from '../../services/templates';
import CredentialDisplay from '../credential-display';
import Dialog from '../dialog';

import useCustomSnackbar from '../../helpers/snackbar';

// Defaulte templates
import diplomaTemplate from '../../services/default-templates/diploma';
import blankTemplate from '../../services/default-templates/blank';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(1),
  },
  formLabel: {
    marginBottom: theme.spacing(1),
  },
  headerWrapper: {
    display: 'flex',
    width: '100%',
    paddingRight: theme.spacing(1),
    boxSizing: 'border-box',
  },
  headerSaveBtn: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  templatePreviewWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  templatePreviewPaper: {
    padding: '6px',
    height: '272px',
    background: '#FFFFFF',
    border: '1px solid rgba(0, 0, 0, 0.6)',
    borderRadius: '4px',
    width: '100%',
  },
  templatePreviewPaperDisabled: {
    padding: '6px',
    height: '272px',
    backgroundColor: '#FAFAFA',
    border: '1px solid #DCDCDC',
    borderRadius: '4px',
    width: '100%',
  },
  disabledText: {
    color: 'rgba(0, 0, 0, 0.16)',
  },
  credentialPreviewWrapper: {
    overflow: 'hidden',
    background: '#F9FAFB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleCredWrapper: {
    width: '524px',
    height: '647px',
    minWidth: '524px',
    minHeight: '647px',
    overflow: 'hidden',
    background: '#FFFFFF',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: '4px',
  },
}));

function TemplateFieldEdit({ state, setState }) {
  const classes = useStyles();
  const [user] = useAuthed();
  return (
    <>
      <Grid container spacing={0} style={{ height: '100%' }}>
        <Grid item xs={12} sm={12} md={4}>

        <Box m={4}>
          <TemplateEditInfo state={state} setState={setState} />
        </Box>

        <Divider />

        <Box m={4}>
        <Typography variant="h6" gutterBottom>
          Template content
        </Typography>
        <Typography variant="body2">
          Available variables <strong>{'{name}'}</strong>, <strong>{'{date}'}</strong>
        </Typography>
        <br />

        {state.fields.map((field, index) => {
          function setFieldValue(e) {
            field.default = e.target.value;
            setState({ ...state });
          }

          return (
            <FormControl key={index} fullWidth className={classes.formControl}>
              <TextField
                id="receiverEmail"
                label={field.label}
                placeholder="Enter text or variable..."
                type="email"
                fullWidth
                variant="outlined"
                onChange={setFieldValue}
                value={field.default}
                multiline
              />
            </FormControl>
          );
        })}
      </Box>

      </Grid>
      <Grid item xs={12} sm={12} md={8} className={classes.credentialPreviewWrapper}>
        <Paper elevation={10} className={classes.scaleCredWrapper}>
          <CredentialDisplay schema={state} issuer={user} />
        </Paper>
      </Grid>
            </Grid>
    </>
  );
}

function TemplateEditInfo({ state, setState }) {
  const classes = useStyles();

  function setTemplateValue(e) {
    state.name = e.target.value;
    setState({ ...state });
  }

  return (
    <>
      <Typography variant="h6">
        Template name
      </Typography>
      <br />

        <FormControl fullWidth className={classes.formControl}>
          <TextField
            id="name"
            label="Name"
            placeholder="Enter a name for your template"
            fullWidth
            variant="outlined"
            value={state.name}
            onChange={setTemplateValue}
            required
            autoFocus
          />
        </FormControl>
    </>
  );
}

const defaultTemplates = [{
  name: 'Blank',
  base: blankTemplate,
}, {
  name: 'Diploma',
  base: diplomaTemplate,
}, {
  name: 'ID (Soon)',
  disabled: true,
}];

export default function AddTemplateModal({ onClose, open, template }) {
  const classes = useStyles();
  const [credential, setCredential] = useState(template);
  const snackbar = useCustomSnackbar();

  useEffect(() => {
    if (!credential) {
      setCredential(template);
    }
  }, [template]);

  function handleClose() {
    onClose();
    setCredential(null);
  }

  function handleTemplateClick(template) {
    setCredential(template.base || blankTemplate);
  }

  async function handleSave() {
    const savedTemplate = await saveTemplate(credential);
    onClose(savedTemplate);
    if (credential._id) {
      snackbar.showSuccess('Template saved');
    } else {
      snackbar.showSuccess('New template created');
    }
  }

  const modalHeader = (
    <div className={classes.headerWrapper}>
      <Button onClick={handleClose}>
        Cancel
      </Button>

      <Typography className={classes.headerSaveBtn}>
        {(credential && credential.name) || 'New Template'}
      </Typography>

      {credential && (
        <Button variant="contained" color="primary" onClick={handleSave} disabled={!credential.name}>
          Save
        </Button>
      )}
    </div>
  );

  return (
    <Dialog title={modalHeader} maxWidth="xl" fullScreenBreakpoint="xl" open={open}>
      {credential ? (
        <Grid container spacing={3}>
          <TemplateFieldEdit state={credential} setState={setCredential} />
        </Grid>
      ) : (
        <Container maxWidth="md">
          <Box mt={5} mb={5}>
            <center>
              <Typography variant="h4">
                Choose a template or start from
              </Typography>
            </center>
          </Box>
          <Grid container spacing={4} style={{ margin: '0 auto' }} alignItems="center" justify="center">
            {defaultTemplates.map((defaultTemplate, index) => (
              <Grid item xs={3} sm={3} md={3} key={index} index={index} className={classes.templatePreviewWrapper} onClick={() => !defaultTemplate.disabled &&handleTemplateClick(defaultTemplate)}>
                <Paper variant="outlined" className={defaultTemplate.disabled ? classes.templatePreviewPaperDisabled : classes.templatePreviewPaper}>
                  {defaultTemplate.base && (
                    <CredentialDisplay schema={defaultTemplate.base} scale={0.36} />
                  )}
                </Paper>
                <br />
                <Typography className={defaultTemplate.disabled && classes.disabledText}>
                  {defaultTemplate.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </Dialog>
  );
}
