import assert from 'assert';
import app from '../../src/app';

describe('\'stored-forms\' service', () => {
  it('registered the service', () => {
    const service = app.service('stored-forms');

    assert.ok(service, 'Registered the service');
  });
});
