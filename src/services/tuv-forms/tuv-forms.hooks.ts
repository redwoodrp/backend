import * as authentication from '@feathersjs/authentication';
import { HookContext } from '@feathersjs/feathers';
import User, { UserPermissions } from '../../interfaces/user';
import { Sequelize } from 'sequelize';
import app from '../../app';
import TuvFormData from '../../interfaces/tuvForms';
import { Forbidden } from '@feathersjs/errors';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const checkAccessRights = (context: HookContext) => {
  console.log(context.params.user);
  const allowedPermissions = [UserPermissions.MANAGE_FORM_RESPONSES];
  const user = context.params.user as User;

  if (!context.params.provider) return context; // allow internal
  const userPermissions = (user.permissions as unknown as string).split(',');

  let hasPermission = true;
  allowedPermissions.forEach((permission: UserPermissions) => {
    if (!userPermissions.includes(permission.toString())) {
      hasPermission = false;
    }
  });

  if (hasPermission || !context.id) return context;

  const sq: Sequelize = app.get('sequelizeClient') as Sequelize;
  const form: TuvFormData = sq.models.tuv_forms.findOne({
    where: {
      id: context.id,
    },
  }) as unknown as TuvFormData;

  context.data.checked = form.checked;
  context.data.approved = form.approved;
  context.data.inspector = form.inspector;
  context.data.declineReason = form.declineReason;
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
