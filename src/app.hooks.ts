// Application hooks that run for every service
// Don't remove this comment. It's needed to format import lines nicely.

import errors from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';
const errorHandler = (ctx: HookContext) => {
  if (ctx.error) {
    const error = ctx.error;
    if (!error.code) {
      const newError = new errors.GeneralError('server error');
      ctx.error = newError;
      return ctx;
    }
    if (error.code === 404 || process.env.NODE_ENV === 'production') {
      error.stack = null;
    }
    return ctx;
  }
};


export default {
  before: {
    all: [errorHandler],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
