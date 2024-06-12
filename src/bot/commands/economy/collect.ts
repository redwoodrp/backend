import { Command } from '../../helpers/interfaces';
import { MessageEmbed } from 'discord.js';
import { getBotConfig } from '../../helpers/generic';
import { changeBalance } from '../../helpers/economy';

export const command: Command = {
  name: 'collect',
  description: 'Collect all the money from your roles',
  args: [],
  async run(client, message) {
    const guildConfig = await getBotConfig(message.guildId || '');

    const formattedRoles = [];

    const memberHasRole = (id: string) => message.member?.roles.cache.some(r => r.id === id);
    for (let i = 0; i < guildConfig.moneyRoles.length; i++) {
      const moneyRole = guildConfig.moneyRoles[i];

      // TODO: Check cooldown
      if (memberHasRole(moneyRole.role)) {
        await changeBalance(false, +moneyRole.amount, message.author.id, message.guildId || '');

        formattedRoles.push(`\`${i}\` - <@&${moneyRole.role}>`);
      }
    }

    const embed = new MessageEmbed({
      description: `\\✅ Role income successfully collected!\n\n${formattedRoles.join('\n')}`,
      color: 'BLUE',
    }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());
    await message.channel.send({ embeds: [embed], allowedMentions: { roles: [], users: [] } });
  }
};
