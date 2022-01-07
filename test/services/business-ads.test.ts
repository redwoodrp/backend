import assert from 'assert';
import app from '../../src/app';

describe('\'business-ads\' service', () => {
  it('registered the service', () => {
    const service = app.service('business-ads');

    assert.ok(service, 'Registered the service');
  });
});
