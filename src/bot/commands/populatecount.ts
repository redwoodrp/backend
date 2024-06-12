import { Command } from '../helpers/interfaces';
import { emoji } from '../utils';

export const command: Command = {
  name: 'populatecount',
  description: 'Populate the player count category values',
  guildOnly: true,
  devOnly: true,
  aliases: ['populateplayers'],
  async run(client, message) {
    const before = await message.channel.send(emoji('loading'));

    if (!client.class) return;
    await client.class.refreshPlayerCount();

    before.edit('Done :white_check_mark:');
  },
};
