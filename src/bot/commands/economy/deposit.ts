import { Command, CommandArgument } from '../../helpers/interfaces';
import { MessageEmbed } from 'discord.js';
import { changeBalance, getAndCreateWallet, numberToCashString } from '../../helpers/economy';

export const command: Command = {
  name: 'deposit',
  description: 'Transfer <amount> from cash to your bank account.',
  aliases: ['dep'],
  guildOnly: true,
  args: [
    {
      type: CommandArgument.NUMBER,
      name: 'amount',
    }
  ],
  async run(client, message, args) {
    const amount = args[0].value as unknown as number;
    if (amount <= 0) {
      const embed = new MessageEmbed({
        description: '\\❎ Cannot deposit less than $1!',
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
    await changeBalance(true, +amount, message.author.id, message.guildId || '');

    const embed = new MessageEmbed({
      description: `\\✅ Deposited ${numberToCashString(amount)} to your account!`,
      color: 'BLUE',
    }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());
    await message.channel.send({ embeds: [embed] });
  }
};
