import { Router } from 'express';
import { version } from '../../package.json';
import templates from './templates';
import recipient from './recipient';
import auth from './auth';
import totals from './totals';
import faucet from './faucet';
import credentials from './credentials';
import receivers from './receivers';
import users from './users';

export default ({ config, db }) => {
  const api = Router();

  // mount the templates resource
  api.use('/template', templates({ config, db }));

  // mount the templates resource
  api.use('/credential', credentials({ config, db }));

  // mount the receivers resource
  api.use('/receiver', receivers({ config, db }));

  // mount the users resource
  api.use('/user', users({ config, db }));

  // recipient route
  api.post('/recipient', recipient);

  // auth route
  api.post('/auth', auth);

  // totals route
  api.get('/totals', totals);

  // faucet route
  api.post('/faucet', faucet);

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({ version });
  });

  return api;
};
