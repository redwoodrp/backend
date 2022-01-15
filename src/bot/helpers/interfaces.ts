import Discord, { Channel, Message, Role, Snowflake, User } from 'discord.js';
import Logger from './logger';
import DiscordBot from '../index';
import { BaseDB, NullableBaseDB } from '../../helpers/interfaces/generic';

export enum CommandArgument {
  ROLE,
  USER,
  CHANNEL,
  NUMBER,
  STRING,
}

export interface StringArgument {
  type: CommandArgument.STRING,
  name: string;
  value: string;
}

export interface NumberArgument {
  type: CommandArgument.NUMBER,
  name: string;
  value: number;
}

export interface RoleArgument {
  type: CommandArgument.ROLE,
  name: string;
  value: Role;
}

export interface UserArgument {
  type: CommandArgument.USER,
  name: string;
  value: User;
}

export interface ChannelArgument {
  type: CommandArgument.CHANNEL,
  name: string;
  value: Channel;
}

export type ParsedArgument =
  StringArgument
  | NumberArgument
  | RoleArgument
  | UserArgument
  | ChannelArgument;

export interface Command {
  name: string,
  description: string,
  aliases?: Array<string>,
  /** @deprecated use `handler.getCommandUsage(Command)` instead */
  usage?: string,
  args?: {
    type: CommandArgument,
    name: string,
    optional?: boolean,
    spread?: boolean,
  }[],
  devOnly?: boolean,
  guildOnly?: boolean,
  run: (client: Client, message: Discord.Message, args: ParsedArgument[]) => void | Promise<Message | undefined | void>,
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

export interface Wallet extends NullableBaseDB {
  user: string;
  cash: number;
  bank: number;
  total: number;
  leaderboard?: number;
}

export interface NullableWallet extends NullableBaseDB {
  user?: string;
  cash?: number;
  bank?: number;
  total?: number;
  leaderboard?: number;
}

export interface SerializedBotConfig {
  guildId: string;
  startBalance: number;
  commandRestrictions: string;
  chatMoney: string;
  auditLogChannel: string | null;
  moneyRoles: string;
  commandSettings: string;
}

export interface BotConfig extends NullableBaseDB {
  guildId: string;
  startBalance: number;
  commandRestrictions: {
    command: string,
    channels: Snowflake[],
  }[];
  chatMoney: {
    channel: Snowflake,
    min: number,
    max: number,
  }[];
  auditLogChannel: Snowflake | null;
  moneyRoles: {
    role: Snowflake,
    amount: number,
    cooldown: number,
  }[];
  commandSettings: {
    work?: WorkCommandSettings,
    slut?: SlutCommandSettings,
    crime?: SlutCommandSettings,
  }
}

export interface WorkCommandSettings {
  min: number;
  max: number;
  cooldown: number;
}

export interface SlutCommandSettings {
  min: number;
  max: number;
  cooldown: number;
  // in %
  fineChance: number;
  fineAmount: {
    // in %
    min: number,
    // in %
    max: number,
  };
}

export interface CommandLastExecuted extends BaseDB{
  user: string;
  command: string;
  lastExecuted: string;
}
