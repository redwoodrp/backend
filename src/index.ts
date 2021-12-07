import logger from './logger';
import app from './app';
import DiscordBot from './bot';

const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', async () => {
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port);

  const bot = new DiscordBot();
  await bot.login();

  app.set('discordBot', bot);
});