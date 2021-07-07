import React from 'react';
import { Snackbar, Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

export default function CustomSnackbar({
  message,
  action,
  ButtonProps,
  SnackbarProps,
  customParameters,
}) {
  return (
    <Snackbar autoHideDuration={3000} {...SnackbarProps} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert
        severity={customParameters && customParameters.type}
        action={
          action != null && (
            <Button color="inherit" size="small" {...ButtonProps}>
              {action}
            </Button>
          )
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
