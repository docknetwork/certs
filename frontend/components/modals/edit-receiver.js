import React, { useState } from 'react';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';

import useCustomSnackbar from '../../helpers/snackbar';
import { saveReceiver } from '../../services/credentials';
import Dialog from '../dialog';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(1),
  },
  fullWidth: {
    width: '100%',
  },
  generateButton: {
    width: '100%',
    marginTop: '8px',
    height: '40px',
  },
}));

export default function EditReceiverModal(props) {
  const classes = useStyles();
  const snackbar = useCustomSnackbar();
  const { receiver } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    ...receiver,
  });

  function handleChange(event) {
    data[event.target.id] = event.target.value;
    setData({
      ...data,
    });
  }

  async function handleSave() {
    setIsSubmitting(true);

    let result;
    try {
      result = await saveReceiver({
        receiverName: data.name,
        receiverEmail: data.email,
        receiverRef: data.reference,
        receiverDID: data.did,
      });
      snackbar.showSuccess('Recipient information updated');
      if (props.onClose) {
        props.onClose(result);
      }
    } catch (e) {
      snackbar.showError(e.toString());
    }

    setIsSubmitting(false);
  }

  const actions = (
    <>
      <Button onClick={() => props.onClose()} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button autoFocus variant="contained" color="primary" onClick={handleSave} disabled={isSubmitting}>
        Save Recipient
      </Button>
    </>
  );

  return (
    <Dialog title={receiver && `Edit Recipient: ${receiver.name}`} actions={actions} maxWidth="sm" {...props}>
      <ValidatorForm onSubmit={handleSave}>

          <FormControl fullWidth className={classes.formControl}>
            <TextField
              id="reference"
              label="Reference"
              fullWidth
              variant="outlined"
              value={data.reference}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              />
          </FormControl>

          <br /><br />

          <FormControl fullWidth className={classes.formControl}>
            <TextField
              id="name"
              label="Name"
              fullWidth
              variant="outlined"
              value={data.name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              />
          </FormControl>

          <br /><br />

          <FormControl fullWidth className={classes.formControl}>
            <TextValidator
              id="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={data.email}
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
              id="did"
              label="Decentralized Identifier (DID)"
              fullWidth
              variant="outlined"
              value={data.did}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Leave blank if your receiver has no DID."
              />
          </FormControl>

      </ValidatorForm>
    </Dialog>
  );
}
