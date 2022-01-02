import assert from 'assert';
import app from '../../src/app';

describe('\'business-request\' service', () => {
  it('registered the service', () => {
    const service = app.service('business-request');

    assert.ok(service, 'Registered the service');
  });
});
