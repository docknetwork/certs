import 'babel-polyfill';

import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jsonErrorHandler from 'express-json-error-handler';
import bodyParser from 'body-parser';
import initializeDb from './db';
import api from './api';
import config from './config.json';

require('dotenv').config();

const app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
  exposedHeaders: config.corsHeaders,
}));

// body parser
app.use(bodyParser.json({
  limit: config.bodyLimit,
}));

app.use(bodyParser.urlencoded({ extended: false }));

// connect to db
initializeDb((db) => {
  // api router
  app.use('/api', api({ config, db }));

  app.use(jsonErrorHandler());

  app.server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${app.server.address().port}`);
  });
});

export default app;
