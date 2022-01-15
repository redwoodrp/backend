import * as feathersAuthentication from '@feathersjs/authentication';
import * as local from '@feathersjs/authentication-local';
import checkPermissions from '../../helpers/hooks';
import { UserPermissions } from '../../helpers/interfaces/user';
import { HookContext } from '@feathersjs/feathers';
import { Forbidden } from '@feathersjs/errors';
import { disallow } from 'feathers-hooks-common';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = feathersAuthentication.hooks;
const { hashPassword, protect } = local.hooks;
// TODO: REMOVE IF SAFE
// const permissionStringToArray = (ctx: HookContext) => {
//   ctx.result = ctx.result as StoredUser | StoredUser[];
//
//   if (Array.isArray(ctx.result)) {
//     const converted: User[] = [];
//     ctx.result.forEach((user: StoredUser) => {
//       converted.push({
//         ...user,
//         permissions: user.permissions.split(',').map(p => parseInt(p)),
//       });
//     });
//
//     ctx.result = converted;
//     ctx.dispatch = converted;
//     return ctx;
//   }
//
//   const converted = ctx.result.permissions.split(',').map((p: string) => parseInt(p));
//
//   ctx.result.permissions = converted;
//   ctx.dispatch = converted;
//
//   return ctx;
// };
//
// const permissionArrayToString = (ctx: HookContext) => {
//   if (Array.isArray(ctx.data.permissions)) ctx.data.permissions = ctx.data.permissions.join(',');
//   return ctx;
// };

export default {
  before: {
    all: [
      async (context: HookContext) => {
        if (context.path !== 'authentication') {
          await authenticate('jwt');

          if (context.params.provider === undefined) return context;
          else if (!context.params.user) throw new Forbidden('You are not allowed to access this resource.');

          return checkPermissions(context, [UserPermissions.MANAGE_USERS]);
        }
      }
    ],
    find: [authenticate('jwt')],
    get: [],
    create: [hashPassword('password'), disallow('external')],
    update: [hashPassword('password'), authenticate('jwt')],
    patch: [hashPassword('password'), authenticate('jwt')],
    remove: [authenticate('jwt')]
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
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
