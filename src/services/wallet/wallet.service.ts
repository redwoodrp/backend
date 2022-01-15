// Initializes the `wallet` service on path `/wallet`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Wallet } from './wallet.class';
import createModel from '../../models/wallet.model';
import hooks from './wallet.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'wallet': Wallet & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/wallet', new Wallet(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wallet');

  service.hooks(hooks);
}
