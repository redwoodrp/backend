import historyApiFallback from 'connect-history-api-fallback';
import path from 'path';
import favicon from 'serve-favicon';
import compress from 'compression';
import helmet from 'helmet';
import cors from 'cors';

import feathers from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';


import { Application } from './declarations';
import logger from './logger';
import middleware from './middleware';
import services from './services';
import appHooks from './app.hooks';
import channels from './channels';
import { HookContext as FeathersHookContext } from '@feathersjs/feathers';
import authentication from './authentication';
import sequelize from './sequelize';
// Don't remove this comment. It's needed to format import lines nicely.

const app: Application = express(feathers());
export type HookContext<T = any> = { app: Application } & FeathersHookContext<T>;

const historyMiddleware = historyApiFallback({
  verbose: true,
  logger: console.log.bind(console),
});

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
try {
  app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
} catch (e) {
  console.log('public/favicon.ico doesn\'t exist!');
}
// Set up Plugins and providers
app.configure(express.rest());

app.configure(socketio((io) => {
  app.set('io', io);
  io.on('connection', (socket) => {
    app.set('socket', socket);
  });
}));

app.configure(sequelize);

// Configure other middleware (see `middleware/index.ts`)
app.configure(middleware);
app.configure(authentication);
// Set up our services (see `services/index.ts`)
app.configure(services);
// Set up event channels (see channels.ts)
app.configure(channels);

// Host public folder
app.use(historyMiddleware);
app.use('/', express.static(app.get('public')));

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger } as any));

app.hooks(appHooks);

export default app;
