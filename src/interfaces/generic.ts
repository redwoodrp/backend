export interface BaseDB {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface NullableBaseDB {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
}
