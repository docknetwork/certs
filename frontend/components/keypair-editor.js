import React, { useState, useEffect } from 'react';
import { randomAsHex, mnemonicGenerate } from '@polkadot/util-crypto';
import dock from '@docknetwork/sdk';

import Grid from '@material-ui/core/Grid';
import MuiAlert from '@material-ui/lab/Alert';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles } from '@material-ui/core/styles';

import AccountSeedField from './misc/seed-field';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(1),
  },
}));

const keypairTypes = [{
  name: 'Schnorrkel (sr25519, recommended)',
  type: 'sr25519',
}, {
  name: 'Edwards (ed25519, alternative)',
  type: 'ed25519',
}, /* , {
  name: 'ECDSA (Non BTC/ETH compatible)',
  type: 'ecdsa',
} */];

const seedTypes = ['seed (hex or string)', 'mnemonic'];

export default function KeypairEditor({
  title = 'Account', setAccount,
}) {
  const classes = useStyles();
  const [seedType, setSeedType] = useState(seedTypes[0]);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [keyType, setKeyType] = useState(keypairTypes[0]);
  const [derivationPath, setDerivationPath] = useState('');
  const [accountSeed, setAccountSeed] = useState(randomAsHex(32));

  async function generateAccount(seed, key, path) {
    setError(null);
    if (!dock.keyring) {
      await dock.initKeyring();
    }
    try {
      setAccount(dock.keyring.addFromUri(`${seed}${path}`, null, key.type), {
        seed: `${seed}${path}`,
        type: key.type,
      });
    } catch (e) {
      setError('You have entered an incorrect seed or derivation path for the account!');
      setAccount(undefined);
    }
  }

  async function handleChangeSeed(e) {
    const { value } = e.target;
    setAccountSeed(value);
    if (value) {
      generateAccount(value, keyType, derivationPath);
    } else {
      setError('Your account needs a seed.');
      setAccount(undefined);
    }
  }

  function handleChangeKeyType(e) {
    setKeyType(e.target.value);
    generateAccount(accountSeed, e.target.value, derivationPath);
  }

  function handleChangeDerivationPath(e) {
    setDerivationPath(e.target.value);
    generateAccount(accountSeed, keyType, e.target.value);
  }

  function handleChangeSeedType(e) {
    setSeedType(e.target.value);

    let seed;
    if (seedTypes.indexOf(e.target.value) === 0) {
      seed = randomAsHex(32);
    } else {
      seed = mnemonicGenerate();
    }

    setAccountSeed(seed);
    generateAccount(seed, keyType, derivationPath);
  }

  function handleToggleAdvanced() {
    setShowAdvanced(!showAdvanced);
  }

  useEffect(() => {
    generateAccount(accountSeed, keyType, derivationPath);
  }, []);

  return (
    <>
      <AccountSeedField {...{
        seedType, accountSeed, handleChangeSeed, handleChangeSeedType, seedTypes, title,
      }} />

      {error && (
        <MuiAlert severity="error">
          {error}
        </MuiAlert>
      )}

      <MuiAlert severity="info" style={{ marginTop: '4px' }}>
        <strong>Keep this in a safe place.</strong>{' '}
        Consider storing in a signer such as a browser extension, hardware device, phone wallet or an application.
      </MuiAlert>

      <br />

      <span onClick={handleToggleAdvanced} style={{
        color: '#1B76E9',
        cursor: 'pointer',
        fontSize: 16,
      }}>
        Advanced {showAdvanced ? '(hide)' : ''}
      </span>

      <br /><br />

      {showAdvanced && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={6}>
           <FormControl variant="outlined" fullWidth className={classes.formControl}>
             <InputLabel id="crypto-type-label">
               Keypair crypto type
             </InputLabel>
             <Select
                labelId="crypto-type-label"
                id="crypto-type"
                label="Keypair crypto type"
                fullWidth
                variant="outlined"
                renderValue={(value) => value.name}
                value={keyType}
                onChange={handleChangeKeyType}
                required
              >
                {keypairTypes.map((keypairType) => (
                  <MenuItem value={keypairType} key={keypairType.name}>
                    {keypairType.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText variant="outlined">
                If you are moving accounts between applications, ensure that you use the correct type.
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <FormControl fullWidth className={classes.formControl}>
              <TextField
                id="name"
                label="Secret derivation path"
                placeholder="//hard/soft///password"
                helperText="The derivation path allows you to create different accounts from the same base mnemonic."
                fullWidth
                variant="outlined"
                value={derivationPath}
                onChange={handleChangeDerivationPath}
              />
            </FormControl>
          </Grid>
        </Grid>
      )}
    </>
  );
}
