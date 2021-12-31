import { Client } from './helpers/interfaces';
import { ColorResolvable } from 'discord.js';

export function getPrefixes (): Array<string> {
  return ['.'];
}

export function getDevs (): Array<string> {
  return ['414585685895282701'];
}

export function emoji (name: 'loading'): string {
  const label = name.trim().toLowerCase();

  if (label === 'loading') return '<a:loading:884762811195072542>';
  return 'error';
}

export function getEmbedColor (client: Client): ColorResolvable {
  if (client.user?.id === '884458742731653120') return '#04e033';
  return '#ff2323';
}
