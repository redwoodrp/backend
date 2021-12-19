// Initializes the `unbelieva-boat` service on path `/unbelieva-boat`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { UnbelievaBoat } from './unbelieva-boat.class';
import hooks from './unbelieva-boat.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'unbelieva-boat': UnbelievaBoat & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/unbelieva-boat', new UnbelievaBoat(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('unbelieva-boat');

  service.hooks(hooks);
}
