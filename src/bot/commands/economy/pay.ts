import { Command, CommandArgument } from '../../helpers/interfaces';
import { MessageEmbed, User } from 'discord.js';
import { changeBalance, getAndCreateWallet, numberToCashString } from '../../helpers/economy';

export const command: Command = {
  name: 'pay',
  description: 'Pay <amount> to another users bank account.',
  guildOnly: true,
  args: [
    {
      type: CommandArgument.USER,
      name: 'user',
    },
    {
      type: CommandArgument.NUMBER,
      name: 'amount',
    },
    {
      type: CommandArgument.STRING,
      name: 'reason',
      optional: true,
    }
  ],
  async run (client, message, args) {
    const to = args[0].value as User;
    if (to.id === message.author.id) {
      const embed = new MessageEmbed({
        description: '\\❎ You cannot pay yourself!',
        color: 'RED',
      }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());
      return await message.channel.send({ embeds: [embed] });
    }

    const amount = args[1].value as unknown as number;
    if (amount <= 0) {
      const embed = new MessageEmbed({
        description: '\\❎ Cannot pay less than $1!',
        color: 'RED',
      }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());
      return await message.channel.send({ embeds: [embed] });
    }

    const wallet = (await getAndCreateWallet(message.author.id, message.guildId || ''))[0];
    if (wallet.cash < amount) {
      const embed = new MessageEmbed({
        description: '\\❎ You don\'t have that much money on hand right now!',
        color: 'RED',
      }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());
      return await message.channel.send({ embeds: [embed] });
    }

    await changeBalance(false, -amount, message.author.id, message.guildId || '');
    await changeBalance(false, +amount, to.id, message.guildId || '');

    const embed = new MessageEmbed({
      description: `\\✅ ${client.class.getFullUsername(to)} has received your ${numberToCashString(amount)}!`,
      color: 'BLUE',
    }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());
    await message.channel.send({ embeds: [embed] });
  }
};
