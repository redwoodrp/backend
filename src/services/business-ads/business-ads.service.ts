// Initializes the `business-ads` service on path `/business-ads`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { BusinessAds } from './business-ads.class';
import createModel from '../../models/business-ads.model';
import hooks from './business-ads.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'business-ads': BusinessAds & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/business-ads', new BusinessAds(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('business-ads');

  service.hooks(hooks);
}
