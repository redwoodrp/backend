import assert from 'assert';
import app from '../../src/app';

describe('\'wallet\' service', () => {
  it('registered the service', () => {
    const service = app.service('wallet');

    assert.ok(service, 'Registered the service');
  });
});
