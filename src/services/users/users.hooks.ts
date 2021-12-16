import * as feathersAuthentication from '@feathersjs/authentication';
import * as local from '@feathersjs/authentication-local';
import checkPermissions from '../../helpers/hooks';
import { UserPermissions } from '../../interfaces/user';
import { HookContext } from '@feathersjs/feathers';
import { Forbidden } from '@feathersjs/errors';
import { disallow } from 'feathers-hooks-common';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = feathersAuthentication.hooks;
const { hashPassword, protect } = local.hooks;

export default {
  before: {
    all: [
      // iff(
      //   (hook: HookContext) => {
      //     return hook.path !== 'authentication';
      //   },
      //   authenticate('jwt'),
      //   checkPermissions([UserPermissions.MANAGE_USERS]),
      //   /*
      //   TS2345: Argument of type 'Promise<HookContext<any, Service<any>> | undefined>' is not assignable to parameter of
      //   type 'Hook<any, Service<any>>'.   Type 'Promise<HookContext<any, Service<any>> | undefined>' provides no match for the signature
      //   '(context: HookContext<any, Service<any>>): void | HookContext<any, Service<any>> | Promise<void | HookContext<any, Service<any>>>
      //    */
      // ),
      async (context: HookContext) => {
        if (context.path !== 'authentication') {
          await authenticate('jwt');

          if (context.params.provider === undefined) return context;
          else if (!context.params.user) throw new Forbidden('You are not allowed to access this resource.');

          return checkPermissions(context, [UserPermissions.MANAGE_USERS]);
        }
      }
    ],
    find: [authenticate('jwt'), (hook: HookContext) => {
      if(hook.params.query && hook.params.query.$paginate) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        hook.params.paginate = hook.params.query.$paginate === 'false' || hook.params.query.$paginate === false;
        delete hook.params.query.$paginate;
      }
    }],
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
