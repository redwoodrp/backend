// Initializes the `feedback` service on path `/feedback`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Feedback } from './feedback.class';
import hooks from './feedback.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'feedback': Feedback & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/feedback', new Feedback(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('feedback');

  service.hooks(hooks);
}
