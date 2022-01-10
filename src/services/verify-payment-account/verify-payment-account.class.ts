import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { BadRequest, NotImplemented } from '@feathersjs/errors';
import DiscordBot from '../../bot';
import { MessageEmbed, MessageReaction, User as DiscordUser } from 'discord.js';
import { Business } from '../../helpers/interfaces/business';
import User from '../../helpers/interfaces/user';

interface Data {
  price: number;
  business: Business;
  author: User;
  username: string;
  verified: boolean;
  reason?: string;
}

interface ServiceOptions {
}

export class VerifyPaymentAccount implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    throw new NotImplemented();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get (id: Id, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (data: Data, params?: Params): Promise<Data> {
    if (!data.hasOwnProperty('username')) throw new BadRequest('username not in data');
    if (!data.hasOwnProperty('author')) throw new BadRequest('author not in data');
    if (!data.hasOwnProperty('business')) throw new BadRequest('business not in data');
    if (!data.hasOwnProperty('price')) throw new BadRequest('price not in data');

    const bot = this.app.get('discordBot') as DiscordBot;
    bot.logger.log(`Checking payment account ${data.username}`);

    const [username, discriminator] = data.username.split('#');
    if (!bot.guild) throw new Error();
    await bot.guild.members.fetch();

    const user = bot.client.users.cache.find(user => user.username === username && user.discriminator === discriminator);
    if (!user) return {
      ...data,
      verified: false,
      reason: 'Couldn\'t find user. Is it in the guild?',
    };

    const getFullAuthorName = () => `${data.author.username}#${data.author.discriminator}`;

    const embed = new MessageEmbed({
      title: 'Verify payment account',
      description: `An account named ${getFullAuthorName()} just created a new in-game ad (on rdwrp.com). By reacting with the checkmark, ${data.price} will be subtracted from your RedwoodRP bank account. If you aren't ${getFullAuthorName()}, please press the crossmark below to decline the payment.`,
      color: 'GREEN',
    });
    embed.setTimestamp();
    embed.setFooter(`Account added by: ${getFullAuthorName()}`);
    const msg = await user.send({ embeds: [embed] });

    await msg.react('<:check:926896894691667989>');
    await msg.react('<:decline:926896894989451364>');

    const filter = (reaction: MessageReaction, user: DiscordUser) => {
      return (reaction.emoji.id === '926896894691667989' || reaction.emoji.id === '926896894989451364') && user.id !== bot.client.user?.id;
    };
    return await msg.awaitReactions({ filter, max: 1, time: 20_000, errors: ['time'] })
      .then(async (collected) => {
        const reaction = collected.first();
        if (!reaction) return { ...data, verified: false, reason: 'Error. Reaction not found' };

        if (reaction.emoji.name === 'check') {
          const embed = new MessageEmbed({
            title: '<:check:926896894691667989> Payment account accepted.',
            description: `$${data.price} will be withdrawn from this account once a moderator accepts the ad. If a moderator declines it, nothing will be withdrawn and you will be notified.`,
            color: 'GREEN',
          });
          embed.setFooter(`Account added by: ${getFullAuthorName()} (${data.author.discordId})`).setTimestamp();

          await msg.edit({ embeds: [embed] });
          return {
            ...data,
            verified: true,
            reason: 'User accepted request.',
          };
        }
        const embed = new MessageEmbed({
          title: '<:decline:926896894989451364> Payment account declined.',
          description: 'No money will be withdrawn from this account.',
          color: 'RED',
        });
        embed.setFooter(`Account added by: ${getFullAuthorName()} (${data.author.discordId})`).setTimestamp();

        await msg.edit({ embeds: [embed] });
        return {
          ...data,
          verified: false,
          reason: 'User declined request.',
        };
      })
      .catch(() => {
        msg.reply('<:decline:926896894989451364> Payment account declined. You either reacted with the wrong emoji or took too long!');
        return { ...data, verified: false };
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove (id: NullableId, params?: Params): Promise<Data> {
    throw new NotImplemented();
  }
}
