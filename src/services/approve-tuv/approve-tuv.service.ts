// Initializes the `approve-tuv` service on path `/approve-tuv`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ApproveTuv } from './approve-tuv.class';
import hooks from './approve-tuv.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'approve-tuv': ApproveTuv & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/approve-tuv', new ApproveTuv(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('approve-tuv');

  service.hooks(hooks);
}
