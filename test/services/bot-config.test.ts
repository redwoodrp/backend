import assert from 'assert';
import app from '../../src/app';

describe('\'bot-config\' service', () => {
  it('registered the service', () => {
    const service = app.service('bot-config');

    assert.ok(service, 'Registered the service');
  });
});
