import { HookContext, HooksObject } from '@feathersjs/feathers';
import { authenticate } from '@feathersjs/authentication';
import app from '../../app';
import DiscordBot from '../../bot';
import { MessageAttachment } from 'discord.js';
import { DriversLicenseWithSignature } from '../../helpers/interfaces/driversLicense';
import fs, { promises as fsp } from 'fs';
import { containsDuplicates } from '../../helpers/generic';
import { NotUnique } from '../../helpers/errors';
import { BadRequest } from '@feathersjs/errors';

const generateAndSendImage = async (context: HookContext) => {
  const bot: DiscordBot | null = app.get('discordBot');
  if (!bot) throw new Error('discordBot does not exist on app!');

  let data: DriversLicenseWithSignature = context.data;
  if (context.id) data = await app.service('drivers-license').get(context.id);
  data = { ...data, signature: context.data.signature, classes: context.data.classes };
  console.log(data.signature);

  const buffer = await bot.generateDriversLicense(data);

  if (!fs.existsSync(`./public/images/${data.owner}`)) await fsp.mkdir(`./public/images/${data.owner}/`);
  await fsp.writeFile(`./public/images/${data.owner}/driverslicense.jpg`, buffer);

  const attachment = new MessageAttachment(buffer, 'driverslicense.jpg');

  const user = await bot.client.users.fetch(data.owner);
  if (!user) throw new Error('User not found!');

  await user.send({
    content: `Hello, ${bot.getFullUsername(user)}!\nHere is your brand new generated drivers license. If you want to make another class then just apply again. Note: You can only have one pending request at a time!`,
    files: [attachment],
  });

  return context;
};

const checkClassDuplicates = async (context: HookContext) => {
  let data: DriversLicenseWithSignature = context.data;
  if (context.id) data = await app.service('drivers-license').get(context.id);
  data = { ...data, signature: context.data.signature, classes: context.data.classes };

  console.log('signature', data.signature);
  if (!data.signature) throw new BadRequest('signature dataURI string missing');

  if (!data.classes) throw new BadRequest();

  if (containsDuplicates(data.classes)) throw new NotUnique();
  return context;
};

// TODO: REMOVE IF SAFE
// const classesToString = (ctx: HookContext) => {
//   ctx.data.classes = ctx.data.classes.join(',');
//   return ctx;
// };
//
// const classesToArray = (ctx: HookContext) => {
//   if (Array.isArray(ctx.result)) {
//     ctx.result = ctx.result.map(r => ({
//       ...r,
//       classes: r.classes.split(','),
//     }));
//     return ctx;
//   }
//
//   ctx.result.classes = ctx.result.classes.split(',');
//   return ctx;
// };

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [authenticate('jwt'), checkClassDuplicates],
    update: [authenticate('jwt'), checkClassDuplicates],
    patch: [authenticate('jwt'), checkClassDuplicates],
    remove: [authenticate('jwt')]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [generateAndSendImage],
    update: [generateAndSendImage],
    patch: [generateAndSendImage],
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
