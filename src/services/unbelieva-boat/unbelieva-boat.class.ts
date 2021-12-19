import { NullableId, Paginated, Params as DefaultParams, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { BadRequest, NotFound, NotImplemented } from '@feathersjs/errors';
import axios, { AxiosError } from 'axios';
import User from '../../interfaces/user';

interface Data {
}

interface ServiceOptions {
}

interface UnbelievaCache {
  // ...
}

interface Params extends DefaultParams {
  user: User;
  query: {
    guildId?: string;
  };
}

interface ApiResponse {
  rank?: string;
  user_id: string;
  cash: number;
  bank: number;
  total: number;
}

export class UnbelievaBoat implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;
  token: string;
  baseURI: string;
  cachesValues: UnbelievaCache;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
    this.token = app.get('unbelieva-token');
    this.baseURI = 'https://unbelievaboat.com/api/v1';
    this.cachesValues = {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    throw new NotImplemented();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get (id: NullableId, params?: Params): Promise<ApiResponse> {
    if (!this.token) this.token = await this.app.get('unbelieva-token');

    if (!params?.query) throw new BadRequest();
    if (params && !params.query.guildId) throw new BadRequest();

    const uri = `${this.baseURI}/guilds/${params.query.guildId}/users/${params.user.discordId}`;


    const res = await axios.get(uri, {
      headers: {
        'Authorization': this.token,
      },
    }).catch((err: AxiosError) => {
      if (err.response?.status === 404) throw new NotFound();
      throw new Error(`[${err.response?.status}] ${err.name}: ${err.message}`);
    });
    if (!res) throw new Error();
    return res.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (data: Data, params?: Params): Promise<Data> {
    throw new NotImplemented();
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
