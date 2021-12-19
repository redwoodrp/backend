import * as authentication from '@feathersjs/authentication';
import { HookContext } from '@feathersjs/feathers';
import User, { UserPermissions } from '../../interfaces/user';
import { Sequelize } from 'sequelize';
import app from '../../app';
import TuvFormData from '../../interfaces/tuvForms';
import { BadRequest, FeathersError, NotAuthenticated } from '@feathersjs/errors';
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

  if (context.method === 'create') {
    context.data.checked = false;
    context.data.approved = false;
    context.data.inspector = null;
    context.data.declineReason = null;
    return context;
  }

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

class VehicleError extends FeathersError {
  constructor(message: string, data?: unknown) {
    super(message, 'vehicle-error', 1000, 'VehicleError', data);
  }
}

export default {
  before: {
    all: [
      (context: HookContext) => {
        if (context.method !== 'get' && context.method !== 'find') {
          authenticate('jwt');
        }
      },
    ],
    find: [
      async (context: HookContext) => {
        if (context.params.query && context.params.query.$count) {
          const sequelizeClient: Sequelize | null = app.get('sequelizeClient');
          if (!sequelizeClient) throw new Error('SequelizeClient doesnt exist.');

          if (!context.params.user) throw new NotAuthenticated();

          const count = await sequelizeClient.models.tuv_forms.count({
            where: {
              owner: (context.params.user as User).discordId,
            }
          });

          context.result = {
            count,
          };
          return context;
        }

        return context;
      },
    ],
    get: [],
    create: [
      checkAccessRights,
      (context: HookContext) => {
        interface VehicleParts {
          [key: string]: string;
        }

        console.log(context);

        const data = context.data as TuvFormData;
        if (!data || !context.data.fileData) throw new BadRequest('fileData is required but missing!');

        const fileData = JSON.parse(context.data.fileData);
        const vehicleParts = fileData.parts as VehicleParts;
        if (!vehicleParts) throw new Error('Corrupt file uploaded!');

        const disallowedTires = ['race', 'mud', 'crawl', 'slick', 'rally'];

        if (vehicleParts.n2o_shot && vehicleParts.n2o_shot.length > 0) throw new VehicleError('Vehicle may not contain a Nitrous Oxide System.');
        if (Object.keys(vehicleParts).filter(k => k.includes('exhaust') && vehicleParts[k] === '').length !== 0) throw new VehicleError('Vehicle has to have an exhaust.');
        if (data.vehicleWeight < 950 && data.engineHorsepower > 200) throw new VehicleError('Vehicle may not be under 950kg and over 200hp.');

        Object.values(vehicleParts).forEach(p => {
          if (p.includes('exhaust_race')) throw new VehicleError('Vehicle may not contain a race exhaust.');
          if (p.includes('glass_tint')) throw new VehicleError('Vehicle may not have tinted glass.');
          if (p.includes('light') && p.includes('covered')) throw new VehicleError('Vehicle may not have covered lights.');
          if (p.includes('sidepipe')) throw new VehicleError('Vehicle may not contain sidepipes.');

          if (p.includes('tire')) {
            disallowedTires.forEach((tire) => {
              if (p.includes(tire)) throw new VehicleError(`Vehicle may not have ${tire} tires.`);
            });
          }
        });

        delete context.data.fileData;
        return context;
      },
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
