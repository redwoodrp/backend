import { Command, CommandArgument, NullableWallet } from '../../helpers/interfaces';
import { MessageEmbed, User } from 'discord.js';
import { getAndCreateWallet, numberToCashString } from '../../helpers/economy';
import app from '../../../app';

export const command: Command = {
  name: 'set-money',
  description: 'Set a <@user>\'s bank/cash to <amount>.',
  guildOnly: true,
  args: [
    {
      type: CommandArgument.USER,
      name: 'user',
    },
    {
      type: CommandArgument.STRING,
      name: 'bank|cash',
    },
    {
      type: CommandArgument.NUMBER,
      name: 'amount',
    },
    {
      type: CommandArgument.STRING,
      name: 'reason',
      optional: true,
      spread: true,
    },
  ],
  async run(client, message, args) {
    const user = args[0].value as unknown as User;
    if (args[1].type !== CommandArgument.STRING) return;
    if (args[2].type !== CommandArgument.NUMBER) return;

    const wallet = (await getAndCreateWallet(user.id, message.guildId || ''))[0];
    const isBank = !args[1].value.toLowerCase().includes('cash');

    const data = {} as NullableWallet;
    data[isBank ? 'bank' : 'cash'] = args[2].value;
    data.total = args[2].value + wallet[isBank ? 'bank' : 'cash'];

    await app.service('wallet').patch(wallet.id || -1, data);

    const embed = new MessageEmbed({
      description: `\\✅ Set ${user.username}'s ${isBank ? 'bank' : 'cash'} balance to ${numberToCashString(args[2].value)}!`,
      color: 'BLUE',
    }).setAuthor(client.class.getFullUsername(user), user.displayAvatarURL());
    await message.channel.send({ embeds: [embed] });
  }
};
