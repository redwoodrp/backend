import { Command, CommandLastExecuted } from '../../helpers/interfaces';
import { MessageEmbed } from 'discord.js';
import { changeBalance, getCoolDownStatus, numberToCashString } from '../../helpers/economy';
import { getBotConfig } from '../../helpers/generic';
import app from '../../../app';
import { randomRange } from '../../utils';

export const command: Command = {
  name: 'crime',
  description: 'Commit a crime. But be careful: You can be fined!',
  guildOnly: true,
  args: [],
  async run(client, message, args) {
    const guildConfig = await getBotConfig(message.guildId || '');
    const crimeSettingsExist = Object.prototype.hasOwnProperty.call(guildConfig.commandSettings, 'crime');
    if (!crimeSettingsExist) {
      guildConfig.commandSettings.crime = {
        cooldown: 3600,
        min: 1500,
        max: 3500,
        fineAmount: {
          min: 800,
          max: 1200,
        },
        fineChance: 0.2,
      };

      await app.service('bot-config').patch(guildConfig.id || -1, {
        commandSettings: guildConfig.commandSettings,
      });
    }

    if (!guildConfig.commandSettings.crime) return;
    const coolDownStatus = await getCoolDownStatus('crime', message.author.id, guildConfig);
    if (coolDownStatus.active) {
      const embed = new MessageEmbed({
        description: `:stopwatch: You cannot commit crimes for another ${coolDownStatus.expires} min!`,
        color: 'RED',
      }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());
      return await message.channel.send({ embeds: [embed] });
    }

    await app.service('discord-last-executed').create({
      user: message.author.id,
      command: 'crime',
      lastExecuted: new Date().toISOString(),
    } as CommandLastExecuted);

    const { min, max } = guildConfig.commandSettings.crime;
    const fails = Math.random() < guildConfig.commandSettings.crime.fineChance;

    const pay = fails ? -randomRange(min, max) : randomRange(min, max);
    await changeBalance(false, pay, message.author.id, message.guildId || '');

    const failEmbed = new MessageEmbed({
      description: `:rolling_eyes: +#$&! You got caught stealing cheese. You got fined ${numberToCashString(-pay)}!`,
      color: 'RED',
    }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());

    const embed = new MessageEmbed({
      description: `\\✅ You stole a paperclip and sold it for ${numberToCashString(pay)}!`,
      color: 'BLUE',
    }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());
    await message.channel.send({ embeds: [fails ? failEmbed : embed] });
  }
};
