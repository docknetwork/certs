import React from 'react';

import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(1),
  },
}));

export default function AccountSeedField({
  seedType, accountSeed, handleChangeSeed, handleChangeSeedType, seedTypes, title = 'Account',
}) {
  const classes = useStyles();
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={12} md={9}>
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            id="seed"
            label={`${title} ${seedType}`}
            placeholder="Enter or generate a seed, keep this safe!"
            fullWidth
            variant="outlined"
            value={accountSeed}
            onChange={handleChangeSeed}
            required
          />
        </FormControl>
      </Grid>
        <Grid item xs={12} sm={12} md={3}>
       <FormControl variant="outlined" fullWidth className={classes.formControl}>
         <InputLabel id="demo-simple-select-label">
           Type
         </InputLabel>
         <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Type"
            fullWidth
            variant="outlined"
            value={seedType}
            onChange={handleChangeSeedType}
            required
          >
            {seedTypes.map((value) => (
              <MenuItem value={value} key={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
