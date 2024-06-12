import { Command } from '../helpers/interfaces';
import { CategoryChannel } from 'discord.js';

export const command: Command = {
  name: 'resetcount',
  description: 'Reset the player count category values',
  guildOnly: true,
  devOnly: true,
  aliases: ['resetplayers'],
  async run(client, message) {
    message.channel.send('Flushing channel...');

    if (!client.class.playerCountCategory) return;
    const category = await client.channels.fetch(client.class.playerCountCategory.id) as CategoryChannel;
    if (category.type !== 'GUILD_CATEGORY') throw new Error(`Category channel is not of type GUILD_CATEGORY (!== ${category.type})`);

    category.children.forEach(c => c.delete('Cleaning Player count category'));
  },
};
