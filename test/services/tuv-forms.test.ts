import assert from 'assert';
import app from '../../src/app';

describe('\'tuv-forms\' service', () => {
  it('registered the service', () => {
    const service = app.service('tuv-forms');

    assert.ok(service, 'Registered the service');
  });
});
