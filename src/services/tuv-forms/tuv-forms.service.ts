// Initializes the `tuv-forms` service on path `/tuv-forms`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { TuvForms } from './tuv-forms.class';
import createModel from '../../models/tuv-forms.model';
import hooks from './tuv-forms.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'tuv-forms': TuvForms & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/tuv-forms', new TuvForms(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('tuv-forms');

  service.hooks(hooks);
}
