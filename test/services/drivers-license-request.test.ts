import assert from 'assert';
import app from '../../src/app';

describe('\'drivers-license-request\' service', () => {
  it('registered the service', () => {
    const service = app.service('drivers-license-request');

    assert.ok(service, 'Registered the service');
  });
});
