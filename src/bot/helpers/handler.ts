import { promises as fsp } from 'fs';
import fs from 'fs';
import Discord from 'discord.js';
import { getDevs, getPrefixes } from '../utils';
import { Client, Command } from './interfaces';
import Logger from './logger';

export default class CommandHandler {
  private readonly client: Client | null = null;
  private readonly logger: Logger | null = null;

  constructor (client: Client, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  /**
   * Register all commands events sub+direct
   * -
   * Returns a promise (error, void)
   */
  public registerAll (path: string, prepend = 'src', ext = '.ts'): Promise<Error | void> {
    return new Promise((resolve, reject) => {
      this.register(path, prepend, ext).then(() => {
        this.registerSub(path, prepend).then(() => {
          resolve();
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Register all commands/events in sub folders
   * -
   * Returns a promise (error, void)
   */
  public registerSub (path: string, prepend = 'src'): Promise<Error | void> {
    return new Promise((resolve, reject) => {
      fsp.readdir(`./${prepend}/${path}`).then((files: Array<string>) => {
        files.map(async (folder) => {
          if (fs.lstatSync(`./${prepend}/${path}/${folder}`).isDirectory()) {
            await this.register(`${path}/${folder}`, prepend);
          }
        });
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Register all commands/events in a static folder (depth = 1)
   * -
   * Returns a promise (error, void)
   */
  public register (path: string, prepend = 'src', ext = '.ts'): Promise<Error | void> {
    return new Promise((resolve, reject) => {
      fsp.readdir(`./${prepend}/${path}`).then((files: Array<string>) => {
        files.map((file) => {
          if (file.endsWith(ext)) {
            const cmd = import(`../../${path}/${file}`);
            cmd.then((obj) => {
              this.client?.commands.set(obj.command.name, obj.command);
              this.logger?.log('Registering command:', obj.command.name);
            }).catch((err: Error) => {
              reject(err);
            });
          }
        });
        resolve();
      }).catch((err: Error) => {
        reject(err);
      });
    });
  }

  /**
   * Handle the command
   * -
   * Handle a message, run the command
   */
  public handle (message: Discord.Message): void {
    if (!this.client) return;
    if (!this.logger) return;

    for (const prefix of getPrefixes()) {
      if (message.content.startsWith(prefix)) {
        const args = message.content.substring(prefix.length).split(/ +/);
        const cmd = this.client.commands.find((x) => {
          if (x.aliases == null) x.aliases = [];
          return x.name == args[0].toLowerCase() || x.aliases.includes(args[0].toLowerCase());
        });

        // Run command if not null
        if (!cmd) return;
        if (this.checkCommand(cmd, message)) {
          try {
            args.shift();
            cmd.run(this.client, message, args);
          } catch (err) {
            message.channel.send(`An error occurred in command ${cmd.name}.\n\`\`\`\n${(err as Error).stack}\n\`\`\``);
          }
        }
      }
    }
  }

  private checkCommand (cmd: Command, message: Discord.Message): boolean {
    if (message.author.bot) return false;
    this.logger?.log(cmd.guildOnly, message.channel.type);
    if (cmd.guildOnly && message.channel.type === 'DM') {
      message.channel.send('This command does not support direct messaging.');
      return false;
    }
    return !(cmd.devOnly && !getDevs().includes(message.author.id));
  }
}
