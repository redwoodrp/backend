import assert from 'assert';
import app from '../../src/app';

describe('\'unbelieva-boat\' service', () => {
  it('registered the service', () => {
    const service = app.service('unbelieva-boat');

    assert.ok(service, 'Registered the service');
  });
});
