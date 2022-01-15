// Initializes the `bot-config` service on path `/bot-config`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { BotConfig } from './bot-config.class';
import createModel from '../../models/bot-config.model';
import hooks from './bot-config.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'bot-config': BotConfig & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/bot-config', new BotConfig(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('bot-config');

  service.hooks(hooks);
}
