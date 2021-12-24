import logger from './logger';
import app from './app';
import DiscordBot from './bot';
import { Service } from '@feathersjs/feathers';

const port = app.get('port');


let promise = Promise.resolve();

Object.keys(app.services).forEach(path => {
  const { init } = (app.service(path) as Service<any>);

  if(typeof init === 'function') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    promise = promise.then(() => init());
  }
});

promise.then(() => {
  const server = app.listen(port);

  server.on('listening', async () => {
    logger.info('Feathers application started on http://%s:%d', app.get('host'), port);

    const bot = new DiscordBot();
    await bot.login();

    app.set('discordBot', bot);
  });
});

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);
