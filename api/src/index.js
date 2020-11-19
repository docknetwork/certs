import 'babel-polyfill';

require('dotenv').config();

import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorhandler from 'errorhandler';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

app.use(errorhandler());

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

// body parser
app.use(bodyParser.json({
	limit : config.bodyLimit
}));

app.use(bodyParser.urlencoded({ extended: false }));

// connect to db
initializeDb( db => {
	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
	});
});

export default app;
