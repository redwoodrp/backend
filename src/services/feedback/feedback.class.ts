import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { BadRequest, NotImplemented } from '@feathersjs/errors';
import DiscordBot from '../../bot';

interface Data {
  message: string;
  userId: string;
}

interface ServiceOptions {
}

export class Feedback implements ServiceMethods<Data> {
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
    const bot: DiscordBot = this.app.get('discordBot');
    if (!bot) throw new BadRequest('Bot not found');

    const user = await bot.client.users.fetch(data.userId);
    if (!user) throw new BadRequest('user not found');

    await bot.sendMessage('414585685895282701', `Feedback from ${bot.getFullUsername(user)}:\n\`\`\`\n${data.message}\n\`\`\``);
    return data;
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
