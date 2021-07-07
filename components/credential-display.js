import React from 'react';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';

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

export default function CredentialDisplay({
  schema, receiver = {}, dynamicFields = {}, date = new Date(),
  scale = 1.0,
}) {
  const classes = useStyles();

  function getFieldValue(field, index) {
    const fieldId = `field-${index}`;
    let value = dynamicFields[fieldId] || field.default || '';
    value = value.replace('{name}', receiver.receiverName || 'Receiver Name');
    value = value.replace('{date}', typeof date.getMonth === 'function' ? moment(date).format('MMMM Do, YYYY') : date.toString());
    return value;
  }

  return (
    <div className={classes.credWrapper} style={{ transform: `scale(${scale})` }}>
      {schema.fields.map((field, index) => (
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
