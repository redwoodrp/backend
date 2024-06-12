import { Client } from './helpers/interfaces';
import { ColorResolvable } from 'discord.js';

export function getPrefixes(): Array<string> {
  return ['.'];
}

export function getDevs(): Array<string> {
  return ['414585685895282701'];
}

export function emoji(name: 'loading' | 'checkgradient'): string {
  const label = name.trim().toLowerCase();

  if (label === 'loading') return '<a:loading:884762811195072542>';
  else if (label === 'checkgradient') return '<:checkgradient:926896895165595678>';
  return 'error';
}

export function getEmbedColor(client: Client): ColorResolvable {
  if (client.user?.id === '884458742731653120') return '#04e033';
  return '#ff2323';
}

export function randomRange(from: number, to: number) {
  return Math.floor(Math.random() * (to - from + 1)) + from;
}
