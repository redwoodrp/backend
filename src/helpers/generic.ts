import { UserPermissions } from '../interfaces/user';

export function containsDuplicates (arr: unknown[]): boolean {
  return new Set(arr).size !== arr.length;
}

export function getDefaultPermissions (): UserPermissions[] {
  return [UserPermissions.ACCESS_FORM, UserPermissions.CREATE_RESPONSE];
}
