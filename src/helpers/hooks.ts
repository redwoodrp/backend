import { HookContext } from '@feathersjs/feathers';
import User, { UserPermissions } from './interfaces/user';
import { Forbidden } from '@feathersjs/errors';

export default function checkPermissions (context: HookContext, permissions: UserPermissions[]): HookContext {
  let hasPermissions = true;
  const user = context.params.user as User;

  permissions.forEach((permission) => {
    if (!user.permissions.includes(permission)) hasPermissions = false;
  });

  if (hasPermissions || (context.id?.toString() === user.id.toString() && context.method === 'get')) return context;
  throw new Forbidden('Insufficient permission!');
}
