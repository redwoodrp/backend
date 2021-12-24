import { FeathersError } from '@feathersjs/errors';

export class VehicleError extends FeathersError {
  constructor(message: string, data?: unknown) {
    super(message, 'vehicle-error', 1000, 'VehicleError', data);
  }
}

export class NotUnique extends  FeathersError {
  constructor (message = 'Cannot contain duplicates!', data?: unknown) {
    super(message, 'not-unique', 1001, 'NotUnique', data);
  }
}
