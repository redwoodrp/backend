import { authenticate } from '@feathersjs/authentication';
import { HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import checkPermissions from '../../helpers/hooks';
import { UserPermissions } from '../../interfaces/user';

const membersArrayToString = (ctx: HookContext) => {
  if (!Array.isArray(ctx.data.members)) throw new BadRequest('members has to be type of string[]!');
  ctx.data.members = ctx.data.members.join(',');
  return ctx;
};

const membersStringToArray = (ctx: HookContext) => {
  if (Array.isArray(ctx.result)) {
    ctx.result = ctx.result.map(r => ({ ...r, members: r.members.split(',') }));
    return ctx;
  }

  ctx.result.members = ctx.result.members.split(',');
  return ctx;
};

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
