// Initializes the `discord-last-executed` service on path `/discord-last-executed`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { DiscordLastExecuted } from './discord-last-executed.class';
import createModel from '../../models/discord-last-executed.model';
import hooks from './discord-last-executed.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'discord-last-executed': DiscordLastExecuted & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/discord-last-executed', new DiscordLastExecuted(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('discord-last-executed');

  service.hooks(hooks);
}
