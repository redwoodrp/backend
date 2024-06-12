// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const driversLicenseRequest = sequelizeClient.define('drivers_license_request', {
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    discordName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    class: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    hasTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    additionalNotes: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    signature: {
      type: DataTypes.STRING(100_000),
      allowNull: false,
    },
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (driversLicenseRequest as any).associate = function (models: any): void {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
  };

  return driversLicenseRequest;
}
