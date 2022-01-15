import { authenticate } from '@feathersjs/authentication';

// TODO: REMOVE IF SAFE
// const serializeJSON = (ctx: HookContext) => {
//   const data: BotConfig[] = Array.isArray(ctx.data) ? ctx.data : [ctx.data];
//   const serializedArr: SerializedBotConfig[] = [];
//
//   data.forEach((d, i) => {
//     const s = serializedArr[i];
//     if (d.moneyRoles) s.moneyRoles = JSON.stringify(d.moneyRoles);
//     if (d.commandRestrictions) s.commandRestrictions = JSON.stringify(d.commandRestrictions);
//     if (d.chatMoney) s.chatMoney = JSON.stringify(d.chatMoney);
//     if (d.commandSettings) s.commandSettings = JSON.stringify(d.commandSettings);
//   });
//
//   return {
//     ...ctx,
//     data: serializedArr,
//   };
// };
//
// const deserializeData = (ctx: HookContext) => {
//   const serializedArr: SerializedBotConfig[] = Array.isArray(ctx.result) ? ctx.result : [ctx.result];
//   const data = serializedArr as unknown as BotConfig[];
//
//   serializedArr.forEach((serialized, i) => {
//     const d = data[i];
//     if (serialized.moneyRoles) d.moneyRoles = JSON.parse(serialized.moneyRoles);
//     if (serialized.commandRestrictions) d.commandRestrictions = JSON.parse(serialized.commandRestrictions);
//     if (serialized.chatMoney) d.chatMoney = JSON.parse(serialized.chatMoney);
//     if (serialized.commandSettings) d.commandSettings = JSON.parse(serialized.commandSettings);
//   });
//
//   return {
//     ...ctx,
//     result: data,
//   };
// };

export default {
  before: {
    all: [authenticate('jwt')],
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
