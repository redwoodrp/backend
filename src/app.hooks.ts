// Application hooks that run for every service
// Don't remove this comment. It's needed to format import lines nicely.

import errors from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';

const errorHandler = (ctx: HookContext) => {
  if (ctx.error) {
    const error = ctx.error;
    if (!error.code) {
      ctx.error = new errors.GeneralError('server error');
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
    all: [
      async (context: HookContext) => {
        console.log(context.error);
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
