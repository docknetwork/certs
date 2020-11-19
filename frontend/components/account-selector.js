import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import AddIcon from '@material-ui/icons/Add';

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import dock from '@docknetwork/sdk';

import AddAccountModal from './modals/add-account';

import { getChainAccounts } from '../services/chain';
import { ensureKeyring } from '../helpers/vc';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(1),
  },
  fullWidth: {
    width: '100%',
  },
  flexed: {
    display: 'flex',
  },
  addNewButton: {
    padding: 0,
    marginLeft: 'auto',
    marginTop: 'auto',
    textTransform: 'none',
    fontSize: '15px',
    fontWeight: 'normal',
    marginBottom: theme.spacing(1),
  },
}));

export default function AccountSelector(props) {
  const classes = useStyles();
  const {
    title = 'Using Account', successText = 'Account has been saved!', helperText = 'Use this account to sign transactions with (May cost some balance)', allowAddNew = false, account, setAccount,
  } = props;
  const accounts = getChainAccounts();
  const [showAddAccount, setShowAddAccount] = useState(false);

  function handleCloseAddAccount(chainAccount) {
    setShowAddAccount(false);
    if (chainAccount) {
      handleChange({
        target: {
          value: chainAccount,
        },
      });
    }
  }

  function handleShowAddAccount() {
    setShowAddAccount(true);
  }

  async function handleChange(e) {
    const { value } = e.target;
    if (value && value.seed) {
      await ensureKeyring();
      setAccount(value, dock.keyring.addFromUri(value.seed, null, value.type));
    }
  }

  // useEffect(() => {
  //   if (!account && accounts.length) {
  //     setAccount(accounts[0]);
  //   }
  // }, [account]);

  const selector = (
     <FormControl variant="outlined" fullWidth className={props.className} {...props}>
       <InputLabel id="demo-simple-select-label">
         {title}
       </InputLabel>
       <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label={title}
          fullWidth
          variant="outlined"
          renderValue={(value) => (value.name || value.address)}
          value={account}
          onChange={handleChange}
          required
          margin={props.margin}
          disabled={!accounts.length}
        >
          {accounts.map((savedAccount, index) => (
            <MenuItem value={savedAccount} key={index}>
              {savedAccount.name || savedAccount.address}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText variant="outlined">
          {helperText}
        </FormHelperText>
      </FormControl>
  );

  const wrapped = (
    <>
      {allowAddNew && (
        <>
          <div className={classes.flexed}>
            <Button
              color="primary"
              component="a"
              onClick={handleShowAddAccount}
              className={classes.addNewButton}
              startIcon={<AddIcon />}>
                Add account
            </Button>
          </div>

          <AddAccountModal open={showAddAccount} onClose={handleCloseAddAccount} successText={successText} />
        </>
      )}

      {selector}
    </>
  );

  return allowAddNew ? wrapped : selector;
}
