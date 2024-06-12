import { Command, Wallet } from '../../helpers/interfaces';
import { MessageEmbed, User } from 'discord.js';
import app from '../../../app';
import { numberToCashString } from '../../helpers/economy';

export const command: Command = {
  name: 'leaderboard',
  description: 'Show your balance',
  aliases: ['lb'],
  guildOnly: true,
  args: [],
  async run(client, message, args) {
    const wallets = await app.service('wallet').find({
      query: {
        $select: ['user', 'total'],
        $sort: {
          total: -1,
        },
      },
    }) as Wallet[];

    const embed = new MessageEmbed({
      title: '🏆 Leaderboard',
      description: (await Promise.all(wallets.map(async (w, i) => {
        let u = client.users.cache.get(w.user);
        if (!u) u = await client.users.fetch(w.user);
        return `**${i + 1}.** ${client.class.getFullUsername(u as unknown as User)} • ${numberToCashString(w.total)}`;
      }))).join('\n'),
      color: 'BLUE',
    });
    await message.channel.send({ embeds: [embed] });
  }
};
