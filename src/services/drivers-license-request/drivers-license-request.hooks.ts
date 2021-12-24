import { HookContext, HooksObject } from '@feathersjs/feathers';
import { authenticate } from '@feathersjs/authentication';
import DriversLicense, { DriversLicenseRequest } from '../../interfaces/driversLicense';
import app from '../../app';
import { Sequelize } from 'sequelize';
import { containsDuplicates } from '../../helpers/generic';
import { NotUnique } from '../../helpers/errors';

const checkClassDuplicates = async (context: HookContext) => {
  const sequelizeClient = app.get('sequelizeClient') as Sequelize;
  if (!sequelizeClient) throw new Error('Error getting sequelizeClient!');

  const entry = await sequelizeClient.models.drivers_license.findOne({
    where: {
      owner: (context.data as DriversLicenseRequest).owner,
    },
  }) as unknown as DriversLicense | null;
  if (!entry) return context;

  if (containsDuplicates((entry.classes as unknown as string).split(','))) throw new NotUnique();
};

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [checkClassDuplicates],
    update: [checkClassDuplicates],
    patch: [checkClassDuplicates],
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
} as HooksObject;
