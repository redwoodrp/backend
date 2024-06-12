import { Command, CommandArgument } from '../../helpers/interfaces';
import { MessageEmbed, User } from 'discord.js';
import { changeBalance, numberToCashString } from '../../helpers/economy';

export const command: Command = {
  name: 'add-money',
  description: 'Add <amount> of money to <@user>\'s wallet.',
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

    const isBank = !args[1].value.toLowerCase().includes('cash');
    await changeBalance(isBank, args[2].value, user.id, message.guildId || '');

    const embed = new MessageEmbed({
      description: `\\✅ Added ${numberToCashString(args[2].value)} to ${user.username}'s ${isBank ? 'bank' : 'cash'}!`,
      color: 'BLUE',
    }).setAuthor(client.class.getFullUsername(user), user.displayAvatarURL());
    await message.channel.send({ embeds: [embed] });
  }
};
