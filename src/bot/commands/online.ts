import { BeamMPServer, Command } from '../helpers/interfaces';
import { emoji } from '../utils';
import axios from 'axios';

export const command: Command = {
  name: 'online',
  description: 'Reset the player count category values',
  // guildOnly: true,
  // devOnly: true,
  aliases: ['players'],
  async run(client, message) {
    const previous = await message.channel.send(emoji('loading'));

    // Get data from BeamMP
    const url = 'https://backend.beammp.com/servers-info';
    const res = await axios.get(url);
    if (!res) return;

    const servers = (res.data as BeamMPServer[]).filter(s => s.owner === 'vlad maksimenko#1337').sort((s1, s2) => parseInt(s2.players) - parseInt(s1.players));
    if (!servers) return;

    let msg = '';
    servers.forEach(({ sname, players, playerslist }) => {
      let name = sname.replace(/\^(?:[A-z]|[0-9])/g, '').replace('Redwood', '').replace('Economy', '').replace('[   ', '[ ');
      name = name.replace('[ Modded ]', '**Modded**').replace('[ Vanilla ]', '**Vanilla**').replace('[  ]', '**Normal**').split(' | ')[0];

      msg += `[${players}] ${name}\n`;
    });

    await previous.edit(msg);
  },
};
