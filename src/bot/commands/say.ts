import { Command } from '../helpers/interfaces';

export const command: Command = {
  name: 'say',
  description: 'Let the bot say something',
  usage: '<message>',
  run(client, message) {
    const clean = message.cleanContent.trim().split(' ').splice(1).join(' ');
    if (clean == '') throw new Error('Cannot send an empty message.');
    message.channel.send(clean);
  }
};
