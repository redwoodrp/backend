import { HookContext } from '@feathersjs/feathers';
import { authenticate } from '@feathersjs/authentication';
import checkPermissions from '../../helpers/hooks';
import { UserPermissions } from '../../interfaces/user';
import { membersArrayToString, membersStringToArray } from '../../helpers/generic';

export default {
  before: {
    all: [authenticate('jwt'),],
    find: [],
    get: [],
    create: [(ctx: HookContext) => checkPermissions(ctx, [UserPermissions.MANAGE_BUSINESS_RESPONSES]), membersArrayToString],
    update: [(ctx: HookContext) => checkPermissions(ctx, [UserPermissions.MANAGE_BUSINESS_RESPONSES]), membersArrayToString],
    patch: [(ctx: HookContext) => checkPermissions(ctx, [UserPermissions.MANAGE_BUSINESS_RESPONSES]), membersArrayToString],
    remove: [(ctx: HookContext) => checkPermissions(ctx, [UserPermissions.MANAGE_BUSINESS_RESPONSES]), membersArrayToString]
  },

  after: {
    all: [],
    find: [membersStringToArray],
    get: [membersStringToArray],
    create: [membersStringToArray],
    update: [membersStringToArray],
    patch: [membersStringToArray],
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
