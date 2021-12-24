// Initializes the `drivers-license-request` service on path `/drivers-license-request`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { DriversLicenseRequest } from './drivers-license-request.class';
import createModel from '../../models/drivers-license-request.model';
import hooks from './drivers-license-request.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'drivers-license-request': DriversLicenseRequest & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/drivers-license-request', new DriversLicenseRequest(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('drivers-license-request');

  service.hooks(hooks);
}
