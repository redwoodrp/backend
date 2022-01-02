import { UserPermissions } from '../interfaces/user';

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
