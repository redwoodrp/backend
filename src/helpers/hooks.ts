import { HookContext } from '@feathersjs/feathers';
import User, { UserPermissions } from '../interfaces/user';
import { Forbidden } from '@feathersjs/errors';

export default function checkPermissions (context: HookContext, permissions: UserPermissions[]): HookContext {
  let hasPermissions = true;

  const user = context.params.user as User;
  const userPermissions: string[] = Array.isArray(user.permissions) ? user.permissions as unknown as string[] : (user.permissions as unknown as string).split(',');

  permissions.forEach((permission) => {
    if (!userPermissions.includes(permission.toString())) hasPermissions = false;
  });

  if (hasPermissions || (context.id?.toString() === user.id.toString() && context.method === 'get')) return context;
  throw new Forbidden('Insufficient permission!');
}
