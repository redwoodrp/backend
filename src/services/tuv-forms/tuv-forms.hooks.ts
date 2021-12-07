import * as authentication from '@feathersjs/authentication';
import { HookContext } from '@feathersjs/feathers';
import User, { UserPermissions } from '../../interfaces/user';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const checkAccessRights = (context: HookContext) => {
  console.log(context.params.user);
  const allowedPermissions = [UserPermissions.MANAGE_FORM_RESPONSES];
  const user = context.params.user as User;
  const userPermissions = (user.permissions as unknown as string).split(',');

  let hasPermission = true;
  allowedPermissions.forEach((permission: UserPermissions) => {
    if (!userPermissions.includes(permission.toString())) {
      hasPermission = false;
    }
  });

  if (hasPermission) return context;

  context.data.approved = false;
  context.data.inspector = '';
  context.data.declineReason = '';
  return context;
};

export default {
  before: {
    all: [
      (context: HookContext) => {
        if (context.method !== 'get' && context.method !== 'find') {
          authenticate('jwt');
        }
      },
    ],
    find: [],
    get: [],
    create: [
      checkAccessRights
    ],
    update: [
      checkAccessRights
    ],
    patch: [
      checkAccessRights
    ],
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
