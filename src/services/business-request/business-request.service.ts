// Initializes the `business-request` service on path `/business-request`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { BusinessRequest } from './business-request.class';
import createModel from '../../models/business-request.model';
import hooks from './business-request.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'business-request': BusinessRequest & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/business-request', new BusinessRequest(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('business-request');

  service.hooks(hooks);
}
