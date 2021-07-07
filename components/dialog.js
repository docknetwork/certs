import useMediaQuery from '@material-ui/core/useMediaQuery';

import React from 'react';
import { withStyles, useTheme } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const {
    children, classes, onClose, ...other
  } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export default function CustomDialog({
  children, title = 'Untitled', actions, onClose, contentProps = {}, fullScreenBreakpoint = 'sm', open = true, fullScreen = false, fullWidth = true, maxWidth = 'sm',
}) {
  const theme = useTheme();
  const fullScreenOverride = useMediaQuery(theme.breakpoints.down(fullScreenBreakpoint));

  const titleStyles = typeof title === 'string' ? {} : {
    padding: '10px 15px',
    height: '56px',
  };

  return (
    <Dialog
      onClose={onClose}
      fullScreen={fullScreenOverride || fullScreen}
      TransitionComponent={Transition}
      open={open}
      fullWidth={fullWidth}
      maxWidth={maxWidth}>
      {title && (
        <DialogTitle onClose={onClose} style={titleStyles}>
          {title}
        </DialogTitle>
      )}
      <DialogContent dividers {...contentProps}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
