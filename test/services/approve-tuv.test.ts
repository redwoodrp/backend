import assert from 'assert';
import app from '../../src/app';

describe('\'approve-tuv\' service', () => {
  it('registered the service', () => {
    const service = app.service('approve-tuv');

    assert.ok(service, 'Registered the service');
  });
});
