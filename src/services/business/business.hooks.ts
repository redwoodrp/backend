import { HookContext } from '@feathersjs/feathers';
import { authenticate } from '@feathersjs/authentication';
import checkPermissions from '../../helpers/hooks';
import { UserPermissions } from '../../interfaces/user';

export default {
  before: {
    all: [authenticate('jwt'),],
    find: [],
    get: [],
    create: [(ctx: HookContext) => checkPermissions(ctx, [UserPermissions.MANAGE_BUSINESS_RESPONSES])],
    update: [(ctx: HookContext) => checkPermissions(ctx, [UserPermissions.MANAGE_BUSINESS_RESPONSES])],
    patch: [(ctx: HookContext) => checkPermissions(ctx, [UserPermissions.MANAGE_BUSINESS_RESPONSES])],
    remove: [(ctx: HookContext) => checkPermissions(ctx, [UserPermissions.MANAGE_BUSINESS_RESPONSES])]
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
