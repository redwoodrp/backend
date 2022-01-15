import { Command, CommandArgument } from '../../helpers/interfaces';
import { MessageEmbed, User } from 'discord.js';
import { getAndCreateWallet, numberToCashString } from '../../helpers/economy';
import app from '../../../app';
import { getBotConfig } from '../../helpers/generic';

export const command: Command = {
  name: 'reset',
  description: 'Reset as users economy to the servers start balance.',
  guildOnly: true,
  args: [
    {
      type: CommandArgument.USER,
      name: 'user',
    },
    {
      type: CommandArgument.STRING,
      name: 'reason',
      optional: true,
      spread: true,
    },
  ],
  async run (client, message, args) {
    const user = args[0].value as unknown as User;
    const guildConfig = await getBotConfig(message.guildId || '');

    const wallet = (await getAndCreateWallet(user.id, message.guildId || ''))[0];
    await app.service('wallet').patch(wallet.id || -1, {
      cash: 0,
      bank: guildConfig.startBalance,
      total: guildConfig.startBalance,
    });

    const embed = new MessageEmbed({
      description: `\\✅ Reset ${user.username}'s total balance to ${numberToCashString(guildConfig.startBalance)}!`,
      color: 'BLUE',
    }).setAuthor(client.class.getFullUsername(user), user.displayAvatarURL());
    await message.channel.send({ embeds: [embed] });
  }
};
