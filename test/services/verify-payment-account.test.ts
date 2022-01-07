import assert from 'assert';
import app from '../../src/app';

describe('\'verify-payment-account\' service', () => {
  it('registered the service', () => {
    const service = app.service('verify-payment-account');

    assert.ok(service, 'Registered the service');
  });
});
