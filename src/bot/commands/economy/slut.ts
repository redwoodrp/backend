import { Command, CommandLastExecuted } from '../../helpers/interfaces';
import { MessageEmbed, User } from 'discord.js';
import { changeBalance, getCoolDownStatus, numberToCashString } from '../../helpers/economy';
import { getBotConfig } from '../../helpers/generic';
import app from '../../../app';
import { randomRange } from '../../utils';

export const command: Command = {
  name: 'slut',
  description: 'Be slutty and earn/loose some money.',
  guildOnly: true,
  args: [],
  async run(client, message, args) {
    const guildConfig = await getBotConfig(message.guildId || '');
    const slutSettingsExist = Object.prototype.hasOwnProperty.call(guildConfig.commandSettings, 'slut');
    if (!slutSettingsExist) {
      guildConfig.commandSettings.slut = {
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
    const coolDownStatus = await getCoolDownStatus('slut', message.author.id, guildConfig);
    if (coolDownStatus.active) {
      const embed = new MessageEmbed({
        description: `:stopwatch: You cannot be a slut for another ${coolDownStatus.expires} min!`,
        color: 'RED',
      }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());
      return await message.channel.send({ embeds: [embed] });
    }

    await app.service('discord-last-executed').create({
      user: message.author.id,
      command: 'slut',
      lastExecuted: new Date().toISOString(),
    } as CommandLastExecuted);

    if (!guildConfig.commandSettings.slut) return;
    const { min, max } = guildConfig.commandSettings.slut;

    const fails = Math.random() < guildConfig.commandSettings.slut.fineChance;

    let pay = randomRange(min, max);
    if (fails) pay = -pay;
    await changeBalance(false, pay, message.author.id, message.guildId || '');

    const failEmbed = new MessageEmbed({
      description: `:flushed: Oh shit! Vlad caught you and Doggo being a little too slutty in his office! That's a ${numberToCashString(-pay)} fine!`,
      color: 'RED',
    }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());

    const embed = new MessageEmbed({
      description: `\\✅ You played with Doggo and he payed you ${numberToCashString(pay)}!`,
      color: 'BLUE',
    }).setAuthor(client.class.getFullUsername(message.author), message.author.displayAvatarURL());
    await message.channel.send({ embeds: [fails ? failEmbed : embed] });
  }
};
