import { Command, CommandArgument } from '../../helpers/interfaces';
import { MessageEmbed, Role } from 'discord.js';
import app from '../../../app';
import { getBotConfig } from '../../helpers/generic';

export const command: Command = {
  name: 'remove-money-role',
  description: 'Remove a role from the collect command',
  args: [
    {
      type: CommandArgument.ROLE,
      name: 'role',
    },
  ],
  async run (client, message, args) {
    const role = args[0].value as Role;

    const guildConfig = await getBotConfig(message.guildId || '');
    await app.service('bot-config').patch(guildConfig.id || -1, {
      moneyRoles: guildConfig.moneyRoles.filter((r) => role.id !== r.role),
    });

    const embed = new MessageEmbed({
      title: 'Changed money roles',
      description: `✅ Successfully removed role ${role.name} from money roles.`,
      color: 'BLUE',
    });
    await message.channel.send({ embeds: [embed] });
  }
};
