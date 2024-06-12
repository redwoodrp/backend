import { Command, CommandArgument } from '../../helpers/interfaces';
import { MessageEmbed, Role } from 'discord.js';
import app from '../../../app';
import { getBotConfig } from '../../helpers/generic';

export const command: Command = {
  name: 'add-money-role',
  description: 'Add a role to the collect command',
  args: [
    {
      type: CommandArgument.ROLE,
      name: 'role',
    },
    {
      type: CommandArgument.NUMBER,
      name: 'payout',
    },
    {
      type: CommandArgument.NUMBER,
      name: 'cooldown',
    },
  ],
  async run(client, message, args) {
    console.log(args);

    const role = args[0].value as Role;
    const payout = args[1].value as number;
    const cooldown = args[2].value as number;

    const guildConfig = await getBotConfig(message.guildId || '');
    const moneyRoles = guildConfig.moneyRoles.filter((r) => role.id !== r.role);

    moneyRoles.push({
      role: role.id,
      cooldown,
      amount: payout,
    });

    await app.service('bot-config').patch(guildConfig.id || -1, {
      moneyRoles,
    });

    const embed = new MessageEmbed({
      title: 'Changed money roles',
      description: `✅ Successfully added/edited role ${role.name}.`,
      color: 'BLUE',
    });
    await message.channel.send({ embeds: [embed] });
  }
};
