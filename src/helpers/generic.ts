import { UserPermissions } from '../interfaces/user';
import { HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';

export function containsDuplicates (arr: unknown[]): boolean {
  return new Set(arr).size !== arr.length;
}

export function getDefaultPermissions (): UserPermissions[] {
  return [
    UserPermissions.ACCESS_TUV_FORM,
    UserPermissions.ACCESS_DRIVERS_LICENSE_FORM,
    UserPermissions.ACCESS_BUSINESS_FORM,
    UserPermissions.ACCESS_BUSINESS,
  ];
}

export function membersArrayToString (ctx: HookContext): HookContext {
  if (!Array.isArray(ctx.data.members)) throw new BadRequest('members has to be type of string[]!');
  ctx.data.members = ctx.data.members.join(',');
  return ctx;
}

export function membersStringToArray (ctx: HookContext): HookContext {
  if (Array.isArray(ctx.result)) {
    ctx.result = ctx.result.map(r => ({ ...r, members: r.members.split(',') }));
    return ctx;
  }

  ctx.result.members = ctx.result.members.split(',');
  return ctx;
}
