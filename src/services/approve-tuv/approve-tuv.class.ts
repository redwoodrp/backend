import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import DiscordBot from '../../bot';
import { MessageAttachment, Snowflake } from 'discord.js';
import { Model, Sequelize } from 'sequelize';
import TuvFormData from '../../interfaces/tuvForms';
import { NotFound } from '@feathersjs/errors';
import app from '../../app';
import fs, { promises as fsp } from 'fs';

interface Data {
}

interface ServiceOptions {
}

export class ApproveTuv implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get (id: Id, params?: Params): Promise<Data> {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (rawData: Data, params?: Params): Promise<Data> {
    const data: { userId: Snowflake, dbId: number } = rawData as { userId: Snowflake, dbId: number };

    const bot: DiscordBot = this.app.get('discordBot');
    if (!bot) return data;

    const sq: Sequelize = this.app.get('sequelizeClient');
    if (!sq) return data;

    const res: Model | null = await sq.models.tuv_forms.findOne({
      where: {
        id: data.dbId,
      }
    }) as Model | null;
    if (!res) return new NotFound(`A TÜV form with the id '${data.dbId}' does not exist`);
    const formData = res.get({ plain: true }) as TuvFormData;

    try {
      const buffer = await bot.generateImage(formData);

      if (!fs.existsSync(`./public/images/${data.userId}`)) await fsp.mkdir(`./public/images/${data.userId}/`);
      const res = await fsp.writeFile(`./public/images/${data.userId}/${formData.tid}.jpg`, buffer);

      console.log(res);

      const attachment = new MessageAttachment(buffer, 'tuv.jpg');

      const user = await bot.client.users.fetch(data.userId);
      await user.send({
        files: [attachment],
        content: `Hello, ${bot.getFullUsername(user)}!
Here is your brand-new TÜV card. If you encounter mistakes, please try submitting another TÜV or DM JustMe#8491 when the problem persist.
Here is a permanent link you can use to access the TÜV online: ${app.get('frontend')}/me/tuvs/${formData.tid}.
Have fun playing!`,
      });
    } catch (e) {
      console.log(e);
    }

    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }
}
