import { authenticate } from '@feathersjs/authentication';
import { HookContext } from '@feathersjs/feathers';
import checkPermissions from '../../helpers/hooks';
import { UserPermissions } from '../../helpers/interfaces/user';
import { membersArrayToString, membersStringToArray } from '../../helpers/generic';

export default {
  before: {
    all: [authenticate('jwt'), (ctx: HookContext) => checkPermissions(ctx, [UserPermissions.ACCESS_BUSINESS_FORM])],
    find: [],
    get: [],
    create: [membersArrayToString],
    update: [membersArrayToString],
    patch: [membersArrayToString],
    remove: []
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
