// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const users = sequelizeClient.define('users', {
    discordId: {
      type: DataTypes.STRING,
      // unique: true,
      // primaryKey: true,
      allowNull: false,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    discriminator: {
      type: DataTypes.STRING,
    },

    avatarURI: {
      type: DataTypes.STRING,
    },

    verified: {
      type: DataTypes.BOOLEAN,
    },

    locale: {
      type: DataTypes.STRING,
    },

    mfaEnabled: {
      type: DataTypes.BOOLEAN,
    },

    permissions: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
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
  (users as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return users;
}
