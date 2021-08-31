import React, { useState, useEffect } from 'react';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

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

const typographyTypes = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'button',
  'caption',
  'overline',
];

const jsonFieldTypes = [
  'alumniOf',
  'child',
  'degree',
  'degreeType',
  'degreeSchool',
  'college',
  'name',
  'givenName',
  'familyName',
  'parent',
  'documentPresence',
  'evidenceDocument',
  'spouse',
  'subjectPresence',
];

export default function EditReceiverModal(props) {
  const classes = useStyles();
  const snackbar = useCustomSnackbar();
  const { receiver, field } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState(field || {});

  function handleChange(event) {
    data[event.target.id] = event.target.value;
    setData({
      ...data,
    });
  }

  async function handleSave() {
    setIsSubmitting(true);

    Object.assign(field, data);
    snackbar.showSuccess('Field updated');
    props.onClose();

    setIsSubmitting(false);
  }

  function handleChangeGutter(event) {
    setData({
      ...data,
      gutter: event.target.checked,
    });
  }

  function handleChangeType(event) {
    setData({
      ...data,
      type: event.target.value,
    });
  }

  function handleChangeJsonField(event) {
    setData({
      ...data,
      jsonField: event.target.value,
    });
  }

  useEffect(() => {
    setData(field);
    setIsSubmitting(false);
  }, [field]);

  const actions = (
    <>
      <Button onClick={() => props.onClose()} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button autoFocus variant="contained" color="primary" onClick={handleSave} disabled={isSubmitting}>
        Save Field
      </Button>
    </>
  );

  return (
    <Dialog title="Edit Template Field" actions={actions} maxWidth="sm" {...props}>
      <ValidatorForm onSubmit={handleSave}>
        <div style={{ display: 'flex' }}>
          <FormControl className={classes.formControl} style={{ width: '65%' }}>
            <TextField
              id="label"
              label="Label"
              fullWidth
              variant="outlined"
              value={data && data.label}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              />
          </FormControl>

          <FormControl variant="outlined" className={classes.formControl} style={{ flexGrow: 1, display: 'flex', marginLeft: '10px' }}>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              id="type"
              value={data && data.type}
              onChange={handleChangeType}
              label="Type"
              >
              {typographyTypes.map((type, index) => (
                <MenuItem value={type}>{type}</MenuItem>
              ))}
              </Select>
          </FormControl>
        </div>

        <br />

        <div style={{ display: 'flex' }}>
          <FormControl className={classes.formControl} style={{ width: '65%' }}>
            <TextField
              id="default"
              label="Default text"
              fullWidth
              variant="outlined"
              value={data && data.default}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              />
          </FormControl>

          <FormControl variant="outlined" className={classes.formControl} style={{ flexGrow: 1, display: 'flex', marginLeft: '10px' }}>
            <InputLabel id="jsonField-label">JSON Field</InputLabel>
            <Select
              labelId="jsonField-label"
              id="jsonField"
              value={data && data.jsonField}
              onChange={handleChangeJsonField}
              label="Type"
              placeholder=""
              >
              <MenuItem value="" disabled>None</MenuItem>
              {jsonFieldTypes.map((type, index) => (
                <MenuItem value={type}>{type}</MenuItem>
              ))}
              </Select>
          </FormControl>
        </div>

        <FormControlLabel
          control={<Checkbox col0r="primary" checked={data && data.gutter || false} onChange={handleChangeGutter} id="gutter" name="gutter" />}
          label="Gutter Margin"
        />
      </ValidatorForm>
    </Dialog>
  );
}
