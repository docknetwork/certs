import React from 'react';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme) => ({
  chart: {
    height: '300px',
    padding: '20px 20px 20px 5px',
    display: 'flex',
  },
  flexed: {
    display: 'flex',
    alignItems: 'center',
  },
  heroContent: {
    padding: theme.spacing(8, 0, 6),
    marginBottom: theme.spacing(4),
  },
}));

export default function Hero({ title, text, actions }) {
  const classes = useStyles();
  return (
    <div className={classes.heroContent}>
          <Container maxWidth="md">
            <Typography component="h2" variant="h4" align="center" color="textPrimary" gutterBottom={!!text}>
              {title}
            </Typography>
            {text && (
              <Typography variant="h5" align="center" paragraph>
                {text}
              </Typography>
            )}
            {actions && (
              <Box mt={6}>
                <Grid container spacing={2} justify="center">
                  {actions.map((action, index) => (
                    <Grid key={index} item>
                      {action}
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Container>
    </div>
  );
}
