// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const driversLicense = sequelizeClient.define('drivers_license', {
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    discordName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    classes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },

    instructor: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    issued: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (driversLicense as any).associate = function (models: any): void {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
  };

  return driversLicense;
}
