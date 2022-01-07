// Initializes the `verify-payment-account` service on path `/verify-payment-account`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { VerifyPaymentAccount } from './verify-payment-account.class';
import hooks from './verify-payment-account.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'verify-payment-account': VerifyPaymentAccount & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/verify-payment-account', new VerifyPaymentAccount(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('verify-payment-account');

  service.hooks(hooks);
}
