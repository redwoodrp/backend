import assert from 'assert';
import app from '../../src/app';

describe('\'drivers-license\' service', () => {
  it('registered the service', () => {
    const service = app.service('drivers-license');

    assert.ok(service, 'Registered the service');
  });
});
