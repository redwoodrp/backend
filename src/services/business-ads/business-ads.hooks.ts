import { authenticate } from '@feathersjs/authentication';
import { HookContext } from '@feathersjs/feathers';
import app from '../../app';
import { BadRequest, Forbidden } from '@feathersjs/errors';
import { Sequelize } from 'sequelize';

const checkPermissions = async (ctx: HookContext) => {
  if (!ctx.params.user) throw new BadRequest();

  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const res = await sequelizeClient.models.business.findAll({
    where: {
      ownerId: ctx.params.user.discordId,
    },
  });

  if (res.length === 0) throw new Forbidden();
  return ctx;
};

// TODO: REMOVE IF SAFE
// const positionsToString = (ctx: HookContext) => {
//   ctx.data.positions = ctx.data.positions.join(',');
//   return ctx;
// };
//
// const positionsToArray = (ctx: HookContext) => {
//   if (Array.isArray(ctx.result)) {
//     ctx.result = ctx.result.map(r => ({
//       ...r,
//       positions: r.positions.split(','),
//     }));
//     return ctx;
//   }
//
//   ctx.result.positions = ctx.result.positions.split(',');
//   return ctx;
// };

export default {
  before: {
    all: [authenticate('jwt'), checkPermissions],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
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
