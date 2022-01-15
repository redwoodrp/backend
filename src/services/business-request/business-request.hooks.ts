import { authenticate } from '@feathersjs/authentication';
import { HookContext } from '@feathersjs/feathers';
import checkPermissions from '../../helpers/hooks';
import { UserPermissions } from '../../helpers/interfaces/user';
// TODO: REMOVE IF SAFE

export default {
  before: {
    all: [authenticate('jwt'), (ctx: HookContext) => checkPermissions(ctx, [UserPermissions.ACCESS_BUSINESS_FORM])],
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
