import React, { useState, useEffect } from 'react';

import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import StepLabel from '@material-ui/core/StepLabel';
import AddIcon from '@material-ui/icons/Add';
import Checkbox from '@material-ui/core/Checkbox';

import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';

import { useAuthed } from '../../helpers/auth';
import Dialog from '../dialog';

import { getTemplates, getReceivers } from '../../services/user';

import {
  dataToVC, signVC, verifyVC, getKeypairByAddress,
} from '../../helpers/vc';

import { saveCredential, saveReceiver } from '../../services/credentials';
import CredentialDisplay from '../credential-display';

import useCustomSnackbar from '../../helpers/snackbar';
import { getChainAccounts, savedAccountToKeyring, getSavedDIDs, saveChainAccount, saveDID } from '../../services/chain';

import EmptyHero from '../misc/hero';
import AddDIDModal from './add-did';

import {
  ensureConnection, registerNewDIDUsingPair,
} from '../../helpers/vc';
import { createNewDockDID } from '@docknetwork/sdk/utils/did';
import { apiPost } from '../../services/api';
import { randomAsHex } from '@polkadot/util-crypto';
import dock from '@docknetwork/sdk';

const nodeAddress = process.env.NEXT_PUBLIC_WSS_NODE_ADDR;

function emailIsValid(email) {
  return (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email));
}

function didIsValid(did) {
  return did.indexOf('did:') === 0;
}

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(1),
  },
  formLabel: {
    marginBottom: theme.spacing(1),
  },
  credentialPreviewWrapper: {
    overflow: 'hidden',
    background: '#F9FAFB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  viewJSONLink: {
    marginLeft: 'auto',
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: '12px',
    marginBottom: '10px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  scaleCredWrapper: {
    width: '524px',
    height: '647px',
    overflow: 'hidden',
    background: '#FFFFFF',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: '4px',
  },
  jsonWrapper: {
    width: '524px',
    height: '647px',
    overflowY: 'scroll',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: '4px',
    background: '#444444',
    color: '#FFFFFF',
    padding: '5px 20px',
    fontSize: '14px',
  },
  headerWrapper: {
    display: 'flex',
    width: '100%',
    paddingRight: theme.spacing(1),
    boxSizing: 'border-box',
  },
  headerStepper: {
    width: '100%',
    maxWidth: '310px',
    margin: '0 auto',
    padding: 0,
  },
  flexed: {
    width: '100%',
    display: 'flex',
  },
  generateButton: {
    padding: 0,
    marginLeft: 'auto',
    marginTop: 'auto',
    textTransform: 'none',
    fontSize: '15px',
    fontWeight: 'normal',
  },
  recipientInfoWrapper: {
    display: 'flex',
    fontSize: '16px',
    lineHeight: '24px',
  },
  recipientLabels: {
    minWidth: '52px',
    marginRight: '22px',
  },
  recipientInfo: {
    color: 'rgba(0, 0, 0, 0.6)',
  },
}));

// function CredentialFieldsEdit({ template, dynamicFields, setDynamicFields }) {
//   const classes = useStyles();
//
//   function handleChange(event) {
//     dynamicFields[event.target.id] = event.target.value;
//     setDynamicFields({
//       ...dynamicFields,
//     });
//   }
//
//   return (
//     <>
//       <Typography>
//         Enter your template's dynamic fields here
//       </Typography>
//
//       <br />
//
//       {template.fields.map((field, index) => {
//         const fieldId = `field-${index}`;
//         return field.dynamic && (
//           <FormControl key={index} fullWidth className={classes.formControl}>
//             <TextField
//               id={fieldId}
//               label={field.label}
//               placeholder={field.default}
//               fullWidth
//               variant="outlined"
//               required={!field.default}
//               value={dynamicFields[fieldId]}
//               onChange={handleChange}
//               required={!field.default}
//               />
//           </FormControl>
//         );
//       })}
//     </>
//   );
// }

export function DIDSelector({
  onChange, disabled,
  signTitle = 'Sign credential',
  signMessage = 'Use your Decentralized Identifier (DID) to finalize and sign this credential',
  emptyMessage = 'You need to add a DID in order to sign and issue your credential.',
}) {
  const classes = useStyles();
  const savedDIDs = getSavedDIDs();
  const hasDIDs = !!savedDIDs.length;
  const [showAddDID, setShowAddDID] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [did, setDID] = useState();
  const snackbar = useCustomSnackbar();

  function handleShowDIDModal(event) {
    event.preventDefault();
    setShowAddDID(true);
  }

  function handleCloseDIDModal(newDid, controller) {
    setShowAddDID(false);
    if (typeof newDid === 'string' && typeof controller === 'string') {
      setDID({
        id: newDid,
        controller,
      });
    }
  }

  function handleChangeDID(event) {
    setDID(event.target.value);
  }

  async function requestBalance(account) {
    // Send request to faucet
    try {
      await apiPost('faucet', { address: account.address, nodeAddress });
    } catch (e) {
      console.error(e);
      snackbar.showError('There was an error requesting balance, trying again in 10s...');
      setTimeout(() => {
        requestBalance(account);
      }, 10000);
      return;
    }
    dock.setAccount(account);

    // Double check account has balance
    let hasBalance = false;
    const accountData = await dock.api.query.system.account(account.address);
    hasBalance = accountData.data.free > 0;

      const did = createNewDockDID();

      try {
        const result = await registerNewDIDUsingPair(did, account);

        let didSucceed = false;
        result.events.forEach(({ event: { method } }) => {
          if (method === 'DidAdded') {
            didSucceed = true;
          }
        });

        if (didSucceed) {
          saveDID(did, account.address);
          snackbar.showSuccess('Registered DID!');

        } else {
          snackbar.showError('Unable to register DID, transaction failed. Perhaps it already exists?');
        }
      } catch (e) {
        snackbar.showError(e.toString());
      }
  }

  function generateAccount() {
    const seed = randomAsHex(32);
    const type = 'sr25519';
    const account = dock.keyring.addFromUri(seed, null, type);
    saveChainAccount(account.address, seed, type, 'Certs Account');
    return account;
  }

  async function handleGenerateDID() {
    setIsGenerating(true);
    try {
      await ensureConnection();
      const accounts = getChainAccounts();
      const account = savedAccountToKeyring(accounts[0]) || generateAccount();
      await requestBalance(account);
    } catch (e) {
      snackbar.showError(e.toString());
    }
    setIsGenerating(false);
  }

  useEffect(() => {
    if (!did && savedDIDs.length) {
      setDID(savedDIDs[0]);
    }
  }, []);

  useEffect(() => {
    onChange(did);
  }, [did]);

  const actions = [(
    <>
      <Button key="adddidbtn" onClick={handleShowDIDModal} style={{marginRight: '10px'}}>
        Import my own DID
      </Button>
      <Button key="generatedidbtn" variant="contained" color="primary" onClick={handleGenerateDID}>
        Generate DID
      </Button>
    </>
  )];

  return hasDIDs ? (
    <>
      <Typography variant="h6" gutterBottom className={classes.flexed}>
        {signTitle}
        <Button
          color="primary"
          component="a"
          disabled={disabled}
          onClick={handleShowDIDModal}
          className={classes.generateButton}
          startIcon={<AddIcon />}>
          Add DID
        </Button>
      </Typography>

      <Typography variant="body1">
        {signMessage}
      </Typography>

      <br />

      <FormControl fullWidth className={classes.formControl}>
        <Select
          labelId="select-did-label"
          id="select-did"
          key={did && did.id}
          fullWidth
          placeholder="sada"
          variant="outlined"
          renderValue={(value) => value.id}
          onChange={handleChangeDID}
          disabled={disabled}
          value={did}
          required
          >
          {savedDIDs.map((savedDID) => (
            <MenuItem value={savedDID} key={savedDID.id}>
              {savedDID.id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <AddDIDModal open={showAddDID} onClose={handleCloseDIDModal} />
    </>
  ) : (
    isGenerating ? (
      <>
        <EmptyHero
          title="Generating DID"
          text="Please wait..." />
      </>
    ) : (
      <>
        <EmptyHero
          title="No DIDs"
          text={emptyMessage}
          actions={actions} />
        <AddDIDModal open={showAddDID} onClose={handleCloseDIDModal} />
      </>
    )
  );
}

export default function IssueModal(props) {
  const [user] = useAuthed();
  const classes = useStyles();
  const snackbar = useCustomSnackbar();
  const [data, setData] = useState({
    receiverName: '',
    receiverEmail: '',
    receiverRef: '',
    receiverDID: '',
    receiverCurrent: { name: '' },
  });
  const [state, setState] = useState(0);
  const [sendEmail, setSendEmail] = useState(true);
  const [template, setTemplate] = useState();
  const [templates, setTemplates] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [dynamicFields, setDynamicFields] = useState({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [did, setDID] = useState();
  const [viewJSON, setViewJSON] = useState();

  const steps = ['Add recipient', 'Sign & Issue'];

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const verifiableCredential = dataToVC(did && did.id, data.receiverCurrent, user, new Date(), oneYearFromNow, template);
  const credentialJSON = verifiableCredential && verifiableCredential.toJSON();

  function resetState() {
    setState(0);
    setViewJSON(false);
    setDynamicFields({});
    setData({
      receiverName: '',
      receiverEmail: '',
      receiverRef: '',
      receiverDID: '',
      receiverCurrent: { name: '' },
    });
  }

  async function loadReceivers() {
    const recipientsData = await getReceivers();
    setReceivers(recipientsData);
    if (props.receiver) {
      // TODO: set default receiver with id of props.receiver
    }
  }

  async function loadTemplates() {
    const templatesData = await getTemplates();
    setTemplates(templatesData);
    if (!template && templatesData[0]) {
      setTemplate(templatesData[0]);
    }
  }

  function handleChangeReceiver(event, values) {
    let { value } = event.target;
    let receiverCurrent = values;
    if (values && values.reference) {
      value = values.reference;
    }

    if (!value) {
      value = '';
      receiverCurrent = { name: '' };
    }

    const receiverName = (receiverCurrent && receiverCurrent.name) || data.receiverName;
    const receiverEmail = (receiverCurrent && receiverCurrent.email) || data.receiverEmail;
    const receiverDID = (receiverCurrent && receiverCurrent.did) || data.receiverDID;

    setData({
      ...data,
      receiverRef: value,
      receiverName,
      receiverEmail,
      receiverCurrent,
      receiverDID,
    });
  }

  function handleChange(event) {
    data[event.target.id] = event.target.value && event.target.value.trim();
    setData({
      ...data,
    });
  }

  async function handleIssue() {
    setSubmitting(true);
    try {
      if (!verifiableCredential) {
        throw new Error('no vc');
      }

      if (!data.receiverCurrent || !data.receiverCurrent._id) {
        throw new Error('no receiver');
      }

      // Get controller keypair
      const controllerKeypair = await getKeypairByAddress(did.controller);
      if (!controllerKeypair) {
        throw new Error(`No controller keypair found for address ${did.controller}, try adding one`);
      }

      // Sign and verify
      const signedCredential = await signVC(verifiableCredential, did.id, controllerKeypair);
      const verifyResult = await verifyVC(signedCredential);
      if (!verifyResult.verified) {
        throw new Error('Unable to verify credential');
      }

      // Save it
      const result = await saveCredential(template._id, data.receiverCurrent._id, signedCredential.toJSON(), sendEmail);
      if (result && result._id) {
        result.template = template; // ensure template is populated
        props.onClose(result);
        snackbar.showSuccess('Credential issued');
        resetState();
      }
    } catch (e) {
      snackbar.showError(e.toString());
    }
    setSubmitting(false);
  }

  // async function loadReceivers() {
  //   const templates = await getTemplates();
  //   setTemplates(templates.map(template => {
  //     return {
  //       name: template.name,
  //       year: template._id,
  //     };
  //   }));
  // }

  useEffect(() => {
    loadReceivers();
    loadTemplates();
  }, []);

  function handleToggleJSONView() {
    setViewJSON(!viewJSON);
  }

  function handleClose() {
    props.onClose();
    resetState();
  }

  const handleChangeTemplate = (event) => {
    setTemplate(event.target.value);
  };

  const nextState = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (data.receiverDID && !didIsValid(data.receiverDID)) {
      snackbar.showError('Please enter a valid DID, which is a string that starts with did:');
      return;
    }

    setSubmitting(true);

    let receiver;
    try {
      receiver = await saveReceiver(data);
      if (!receiver._id) {
        throw new Error('Recipient ID undefined');
      }
    } catch (error) {
      snackbar.showError('Unable to register recipient, please check your info try again');
      setSubmitting(false);
      return;
    }

    setData({
      ...data,
      receiverCurrent: receiver,
    });
    setState(state + 1);
    setSubmitting(false);
  };

  const handleStep = (step) => () => {
    if (step < state) {
      setState(step);
    }
  };

  const modalHeader = (
    <div className={classes.headerWrapper}>
      <Button onClick={handleClose} disabled={isSubmitting}>
        Cancel
      </Button>

      <Stepper nonLinear activeStep={state} className={classes.headerStepper}>
        {steps.map((label, index) => {
          const stepProps = {
            completed: state > index,
          };
          return (
            <Step key={label}>
              <StepButton onClick={handleStep(index)} {...stepProps} disabled={isSubmitting}>
                <StepLabel>{label}</StepLabel>
              </StepButton>
            </Step>
          );
        })}
      </Stepper>

      {state === 0 ? (
        <Button variant="contained" color="primary" onClick={nextState} disabled={isSubmitting || !template || !data.receiverRef || !data.receiverEmail || !data.receiverName || !emailIsValid(data.receiverEmail)}>
          {isSubmitting ? 'Please wait...' : 'Next'}
        </Button>
      ) : (
        <Button variant="contained" color="primary" onClick={handleIssue} disabled={isSubmitting || !template || !did}>
          {isSubmitting ? 'Please wait...' : 'Issue Credential'}
        </Button>
      )}
    </div>
  );

  const handleChangeSendEmail = (event) => {
    setSendEmail(event.target.checked);
  };

  return (
    <Dialog title={modalHeader} maxWidth="xl" fullScreenBreakpoint="xl" contentProps={{ style: { padding: 0 } }} open={props.open}>
      <Grid container spacing={0} style={{ height: '100%' }}>
        <Grid item xs={12} sm={12} md={4}>
      {state === 0 ? (
        <ValidatorForm onSubmit={nextState}>
          <Box m={4}>
            <Typography variant="h6">
              Credential template
            </Typography>

            <br />

            <FormControl fullWidth className={classes.formControl}>
             <Select
                labelId="select-did-label"
                id="select-did"
                fullWidth
                variant="outlined"
                renderValue={(value) => value.name}
                value={template}
                onChange={handleChangeTemplate}
                required
                disabled={isSubmitting}
              >
                {templates.map((dbTemplate) => (
                  <MenuItem value={dbTemplate} key={dbTemplate._id}>
                    {dbTemplate.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          <Box m={4}>

          <Typography variant="h6">
            Recipient information
          </Typography>

          <br />

          <FormControl fullWidth className={classes.formControl}>
            <Autocomplete
              inputValue={data.receiverRef}
              value={data.receiverCurrent}
              disabled={isSubmitting}
              onChange={handleChangeReceiver}
              options={receivers}
              getOptionLabel={(option) => option.reference}
              renderInput={(params) => (
                <TextField {...params}
                  label="ID"
                  helperText="Enter a unique reference for your receiver, such as name+dob, ID etc"
                  variant="outlined"
                  onChange={handleChangeReceiver}
                  required />
              )}
            />
          </FormControl>

          <FormControl fullWidth className={classes.formControl}>
            <TextField
              id="receiverName"
              label="Name"
              fullWidth
              variant="outlined"
              value={data.receiverName}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              />
          </FormControl>

          <br /><br />

          <FormControl fullWidth className={classes.formControl}>
            <TextValidator
              id="receiverEmail"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={data.receiverEmail}
              onChange={handleChange}
              disabled={isSubmitting}
              validators={['required', 'isEmail']}
              errorMessages={['This field is required', 'Email is not valid']}
              required
              />
          </FormControl>

          <br /><br />

          <FormControl fullWidth className={classes.formControl}>
            <TextField
              id="receiverDID"
              label="Decentralized Identifier (DID)"
              fullWidth
              variant="outlined"
              value={data.receiverDID}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Leave blank if your receiver has no DID."
              />
          </FormControl>

          {/* template && (
            <CredentialFieldsEdit {...{
              template, dynamicFields, setDynamicFields, receiver: data,
            }} />
          ) */}

          </Box>
        </ValidatorForm>
      ) : (
        <Box m={4}>
          <Box bgcolor="#F4F4F4" mb={5} p={2}>
            <Typography variant="h6" gutterBottom className={classes.flexed}>
              Recipient
            </Typography>
            <div className={classes.recipientInfoWrapper}>
              <div className={classes.recipientLabels}>
                Name:<br />
                ID:<br />
                Email:

                {data.receiverDID && (
                  <>
                    <br />
                    DID:
                  </>
                )}
              </div>
              <div className={classes.recipientInfo}>
                {data.receiverName}<br />
                {data.receiverRef}<br />
                {data.receiverEmail}

                {data.receiverDID && (
                  <>
                    <br />
                    {data.receiverDID}
                  </>
                )}
              </div>
            </div>

            <FormControlLabel
              control={
                <Checkbox
                  checked={sendEmail}
                  onChange={handleChangeSendEmail}
                  name="checkedB"
                  color="primary"
                />
              }
              label="Send email to recipient"
              className={classes.recipientInfo}
            />
          </Box>
          <DIDSelector disabled={isSubmitting} credential={credentialJSON} onChange={setDID} />
        </Box>
      )}
      </Grid>
      <Grid item xs={12} sm={12} md={8} className={classes.credentialPreviewWrapper}>
        {template ? (
          <div className={classes.displayWrapper}>
            <a onClick={handleToggleJSONView} className={classes.viewJSONLink}>
              {viewJSON ? 'Close' : 'View JSON'}
            </a>
            {viewJSON ? (
              <Paper elevation={10} className={classes.jsonWrapper}>
                <pre>
                  {JSON.stringify(credentialJSON, null, 2)}
                </pre>
              </Paper>
            ) : (
              <Paper elevation={10} className={classes.scaleCredWrapper}>
                <CredentialDisplay schema={template} receiver={data} dynamicFields={dynamicFields} issuer={user} />
              </Paper>
            )}
          </div>
        ) : (
          <p>
            Select a template!
          </p>
        )}
      </Grid>
    </Grid>
    </Dialog>
  );
}
