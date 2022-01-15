import { Command, CommandArgument } from '../../helpers/interfaces';
import { MessageEmbed, User } from 'discord.js';
import { getAndCreateWallet, makeOrdinal, numberToCashString } from '../../helpers/economy';

export const command: Command = {
  name: 'balance',
  description: 'Show your balance',
  aliases: ['bal'],
  guildOnly: true,
  args: [{
    type: CommandArgument.USER,
    name: 'user',
    optional: true,
  }],
  async run (client, message, args) {
    const user = args.length === 0 ? message.author : args[0].value as unknown as User;
    const wallet = (await getAndCreateWallet(user.id, message.guildId || ''))[0];

    const embed = new MessageEmbed({
      description: `Leaderboard rank: ${makeOrdinal(wallet.leaderboard || -1)}`,
      fields: [
        {
          name: 'Cash:',
          value: numberToCashString(wallet.cash),
          inline: true,
        },
        {
          name: 'Bank:',
          value: numberToCashString(wallet.bank),
          inline: true,
        },
        {
          name: 'Total:',
          value: numberToCashString(wallet.cash + wallet.bank),
          inline: true,
        },
      ],
      color: 'BLUE',
    }).setAuthor(client.class.getFullUsername(user), user.displayAvatarURL());
    await message.channel.send({ embeds: [embed] });
  }
};
