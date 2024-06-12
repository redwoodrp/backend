import { Command, CommandLastExecuted } from '../../helpers/interfaces';
import { MessageEmbed, User } from 'discord.js';
import { changeBalance, getCoolDownStatus, numberToCashString } from '../../helpers/economy';
import { getBotConfig } from '../../helpers/generic';
import app from '../../../app';
import { randomRange } from '../../utils';

export const command: Command = {
  name: 'work',
  description: 'Earn some money.',
  guildOnly: true,
  args: [],
  async run(client, message, args) {
    const guildConfig = await getBotConfig(message.guildId || '');
    const workSettingsExist = Object.prototype.hasOwnProperty.call(guildConfig.commandSettings, 'work');
    if (!workSettingsExist) {
      guildConfig.commandSettings.work = {
        cooldown: 3600,
        min: 800,
        max: 1500,
      };
      await app.service('bot-config').patch(guildConfig.id || -1, {
        commandSettings: guildConfig.commandSettings,
      });
    }

    if (!guildConfig.commandSettings.work) return;
    const coolDownStatus = await getCoolDownStatus('work', message.author.id, guildConfig);
    if (coolDownStatus.active) {
      const embed = new MessageEmbed({
        description: `:stopwatch: You cannot work for another ${coolDownStatus.expires} min!`,
        color: 'RED',
      }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());
      return await message.channel.send({ embeds: [embed] });
    }

    await app.service('discord-last-executed').create({
      user: message.author.id,
      command: 'work',
      lastExecuted: new Date().toISOString(),
    } as CommandLastExecuted);

    const { min, max } = guildConfig.commandSettings.work;
    const pay = randomRange(min, max);
    await changeBalance(false, +pay, message.author.id, message.guildId || '');

    const embed = new MessageEmbed({
      description: `\\✅ You worked as a developer and earned ${numberToCashString(pay)}!`,
      color: 'BLUE',
    }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());
    await message.channel.send({ embeds: [embed] });
  }
};
