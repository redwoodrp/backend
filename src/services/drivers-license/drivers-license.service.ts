// Initializes the `drivers-license` service on path `/drivers-license`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { DriversLicense } from './drivers-license.class';
import createModel from '../../models/drivers-license.model';
import hooks from './drivers-license.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'drivers-license': DriversLicense & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/drivers-license', new DriversLicense(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('drivers-license');

  service.hooks(hooks);
}
