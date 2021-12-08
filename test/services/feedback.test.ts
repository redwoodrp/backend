import assert from 'assert';
import app from '../../src/app';

describe('\'feedback\' service', () => {
  it('registered the service', () => {
    const service = app.service('feedback');

    assert.ok(service, 'Registered the service');
  });
});
