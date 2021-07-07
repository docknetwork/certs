import React from 'react';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';

import { fieldsRefToTemplate } from '../helpers/vc';

const useStyles = makeStyles((theme) => ({
  credWrapper: {
    padding: theme.spacing(6),
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
    textAlign: 'center',
    width: '524px',
    height: '647px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transformOrigin: 'top left',
  },
}));

export default function CredentialDisplayJSON({
  credential,
  scale = 1.0,
}) {
  const classes = useStyles();

  const variablesMap = credential.credentialSubject[0];
  const subjectVars = Object.keys(variablesMap);

  function getFieldValue(field) {
    let { value } = field;
    for (let i = 0; i < subjectVars.length; i++) {
      const svar = subjectVars[i];
      value = value.replace(`{${svar}}`, variablesMap[svar]);
    }
    value = value.replace('{date}', moment(new Date(credential.issuanceDate)).format('MMMM Do, YYYY'));
    return value;
  }

  const templateReference = credential.credentialSubject[0].referenceId;
  const templateFields = fieldsRefToTemplate(templateReference);

  return (
    <div className={classes.credWrapper} style={{ transform: `scale(${scale})` }}>
      {templateFields.map((field, index) => (
        <Typography
          key={index}
          variant={field.type}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {getFieldValue(field, index)}
          {field.gutter && (
            <>
              <br /><br />
            </>
          )}
        </Typography>
      ))}
    </div>
  );
}
