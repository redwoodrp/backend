import fs, { promises as fsp } from 'fs';
import { getDevs, getPrefixes } from '../utils';
import { Client, Command, CommandArgument, ParsedArgument } from './interfaces';
import Logger from './logger';
import { DiscordAPIError, Message, MessageEmbed, MessageMentions } from 'discord.js';

export default class CommandHandler {
  private readonly client: Client | null = null;
  private readonly logger: Logger | null = null;

  constructor(client: Client, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  /**
   * Register all commands events sub+direct
   * -
   * Returns a promise (error, void)
   */
  public registerAll(path: string, prepend = 'src', ext = '.ts'): Promise<Error | void> {
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
  public registerSub(path: string, prepend = 'src'): Promise<Error | void> {
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
  public register(path: string, prepend = 'src', ext = '.ts'): Promise<Error | void> {
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
  public async handle(message: Message): Promise<void> {
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
        args.shift();

        const canRun = await this.checkCommand(cmd, message, args);
        if (canRun === null || canRun === true) {
          try {

            const cmdArgs = await this.getCommandArgs(cmd, message, args);
            if (typeof cmdArgs === 'string') {
              message.channel.send({
                embeds: [
                  new MessageEmbed({
                    title: 'Error',
                    description: `Input for argument \`${cmdArgs}\` was invalid.`,
                    color: 'RED',
                  }),
                ],
              });
              return;
            }

            await cmd.run(this.client, message, cmdArgs);
          } catch (err) {
            const embed = new MessageEmbed({
              title: 'Error',
              description: Object.prototype.hasOwnProperty.call(err, 'stack') ? (err as Error).stack?.toString() || '' : 'Stack is undefined.',
            });

            getDevs().map(async (id) => {
              if (!this.client) return;
              await (await this.client.users.fetch(id)).send({
                embeds: [embed],
                content: `\`\`\`\n${JSON.stringify(err, null, 2)}\n\`\`\``
              });
            });

            message.channel.send({
              embeds: [
                new MessageEmbed({
                  title: 'Error',
                  description: 'Something unexpected just happened. The developers have already been notified about this. Please try again later!',
                  color: 'RED',
                }),
              ],
            });
          }
        }
      }
    }
  }

  private async checkCommand(cmd: Command, message: Message, args: string[]): Promise<unknown | null> {
    if (message.author.bot) return false;

    if (cmd.guildOnly && message.channel.type === 'DM') {
      return await message.channel.send({
        embeds: [
          new MessageEmbed({
            title: 'Error',
            description: 'This command cannot be executed in DMs. Try it on a server!',
            color: 'BLUE',
          }),
        ],
      });
    }

    if (cmd.args) {
      const required = cmd.args.filter(a => a.optional === undefined ? false : !a.optional);
      if (required.length > args.length || (cmd.args.length < args.length && cmd.args.filter(a => a.spread).length < 1)) {
        return await message.channel.send({
          embeds: [
            new MessageEmbed({
              title: 'Error',
              description: required.length > args.length ? 'Too few arguments given!' : 'Too many arguments given!',
              fields: [
                {
                  name: 'Usage',
                  value: `\`${this.getCommandUsage(cmd)}\`` || 'This command has no usage specified.',
                },
                {
                  name: 'Tip',
                  value: '`$ = @role`; `@ = @user`; `+ = number`; `[...] = optional`',
                },
              ],
              color: 'RED',
            }),
          ]
        });
      }
    }

    return !(cmd.devOnly && !getDevs().includes(message.author.id));
  }

  private async getCommandArgs(cmd: Command, message: Message, args: string[]): Promise<ParsedArgument[] | string> {
    if (cmd.args) {
      let failed: null | string = null;
      const parsedArgs: ParsedArgument[] = [];
      for (let i = 0; i < cmd.args.length; i++) {
        if (!this.client?.class.guild) continue;

        const cmdArg = cmd.args[i];

        if (cmdArg.optional === true && args.length - 1 < i) continue;
        const arg = cmdArg.spread ? args.filter((_, idx) => idx >= i).join(' ') : args[i];

        try {
          // Reset regex state
          MessageMentions.USERS_PATTERN.lastIndex = 0;
          MessageMentions.CHANNELS_PATTERN.lastIndex = 0;
          MessageMentions.ROLES_PATTERN.lastIndex = 0;
          MessageMentions.EVERYONE_PATTERN.lastIndex = 0;

          // CHANNEL
          if (cmdArg.type === CommandArgument.CHANNEL) {
            const match = arg.match(MessageMentions.CHANNELS_PATTERN);
            if (match) {
              const c = await this.client.class.guild.channels.cache.get(match[1]);
              if (!c) continue;
              parsedArgs.push({
                type: CommandArgument.CHANNEL,
                name: cmdArg.name,
                value: c,
              });
              continue;
            }
          }

          // USER
          else if (cmdArg.type === CommandArgument.USER) {
            const match = MessageMentions.USERS_PATTERN.exec(arg);
            if (match) {
              const u = await this.client.users.fetch(match[1]);
              if (!u) continue;
              parsedArgs.push({
                type: CommandArgument.USER,
                name: cmdArg.name,
                value: u,
              });
              continue;
            }
          }

          // ROLE
          else if (cmdArg.type === CommandArgument.ROLE) {
            const match = arg.match(MessageMentions.ROLES_PATTERN);
            if (match) {
              const r = await this.client.class.guild.roles.fetch(match[1]);
              if (!r) continue;
              parsedArgs.push({
                type: CommandArgument.ROLE,
                name: cmdArg.name,
                value: r,
              });
              continue;
            }
          }

          // NUMBER
          else if (cmdArg.type === CommandArgument.NUMBER && !Number.isNaN(parseInt(arg))) {
            parsedArgs.push({
              type: CommandArgument.NUMBER,
              name: cmdArg.name,
              value: parseInt(arg),
            });
            continue;
          }
          // STRING
          else if (cmdArg.type === CommandArgument.STRING) {
            parsedArgs.push({
              type: CommandArgument.STRING,
              name: cmdArg.name,
              value: arg,
            });
            continue;
          }
        } catch (e) {
          if ((e as DiscordAPIError).code === 404) failed = cmdArg.name;
          else throw e;
        }

        failed = cmdArg.name;
      }

      if (failed) return failed;
      return parsedArgs;
    }
    return [];
  }

  private getCommandUsage(cmd: Command): string {
    if (!cmd.args) return '';
    return cmd.args.map(a => {
      let n = a.name;
      if (a.type === CommandArgument.USER) n = `@${a.name}`;
      else if (a.type === CommandArgument.ROLE) n = `$${a.name}`;
      else if (a.type === CommandArgument.CHANNEL) n = `#${a.name}`;
      else if (a.type === CommandArgument.NUMBER) n = `+${a.name}`;

      return `${a.optional ? '[' : '<'}${n}${a.optional ? ']' : '>'}`;
    }).join(' ');
  }
}
