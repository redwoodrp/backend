import Discord from 'discord.js';
import Logger from './logger';
import DiscordBot from '../index';

export interface Command {
  name: string,
  description: string,
  aliases?: Array<string>,
  usage?: string,
  args?: number,
  devOnly?: boolean,
  guildOnly?: boolean,
  run: (client: Client, message: Discord.Message, args: string[]) => void,
}

export interface Client extends Discord.Client {
  class: DiscordBot;
  commands: Discord.Collection<string, Command>,
  logger: Logger,
}

export interface RefreshChannelInterval {
  refreshTime: number;
  interval: number | null;
}

export interface PlayerCount {
  id: string;
  channels: (PlayerCountChannel | PlayerCountPlaceholder)[];
}

export interface PlayerCountPlaceholder {
  _comment?: string;
  id: string | null;
  name: string;
  placeholder: boolean;
  port: undefined;
}

export interface PlayerCountChannel {
  _comment?: string;
  id: string | null;
  port: string;
  name: string;
  placeholder: undefined;
}

export interface BeamMPServer {
  players: string;
  playerslist: string;
  maxplayers: string;
  ip: string;
  location: string;
  port: string;
  dport: string;
  map: string;
  private: boolean;
  sname: string;
  version: string;
  cversion: string;
  official: boolean;
  owner: string;
  sdesc: string;
  pps: string;
  modlist: string;
  modstotal: string;
  modstotalsize: string;
}
