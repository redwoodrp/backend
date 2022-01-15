import assert from 'assert';
import app from '../../src/app';

describe('\'discord-last-executed\' service', () => {
  it('registered the service', () => {
    const service = app.service('discord-last-executed');

    assert.ok(service, 'Registered the service');
  });
});
