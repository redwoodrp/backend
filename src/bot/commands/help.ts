import { Command } from '../helpers/interfaces';
import Discord from 'discord.js';
import { getEmbedColor, getPrefixes } from '../utils';

export const command: Command = {
  name: 'help',
  description: 'Shows what you are seeing right now.',
  usage: 'help <command>',
  async run (client, message, args) {
    const embed = new Discord.MessageEmbed()
      .setColor(getEmbedColor(client))
      .setTitle(':gear: Help')
      .setDescription('Note: `<...>` is a required argument and `[...]` is a optional argument.')
      .setTimestamp()
      .setFooter(`Executed by ${message.author.username}`, message.author.avatarURL({ format: 'png' }) || '');

    client.commands.forEach(c => {
      if (!c.devOnly) {
        if (!c.usage) c.usage = '';

        if (args.length !== 0) {
          if (!c.aliases) c.aliases = [];

          if (args[0].toLowerCase() === c.name || c.aliases.includes(args[0].toLowerCase())) {
            if (c.aliases == null) c.aliases = ['none'];
            embed.addField('Name', `\`\`\`\n${getPrefixes()[0]}${c.name} ${c.usage}\`\`\``, true)
              .addField('Description', `\`\`\`\n${c.description}\`\`\``)
              .addField('Aliases', `\`\`\`\n${c.aliases.join(', ') || 'None'}\`\`\``, true)
              .addField('DMable', `\`\`\`\n${!c.guildOnly ? 'yes' : 'no'}\`\`\``, true);
          }
        } else {
          embed.addField(`**${getPrefixes()[0]}${c.name}**`, `\`\`\`txt\n${c.description}\`\`\``, true);
        }
      }
    });

    await message.channel.send({ embeds: [embed] });
  }
};
