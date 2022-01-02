// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const business = sequelizeClient.define('business', {
    bid: {
      type: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    abbreviation: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    owner: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },

    members: {
      type: DataTypes.UUIDV4,
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
  (business as any).associate = function (models: any): void {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
  };

  return business;
}
