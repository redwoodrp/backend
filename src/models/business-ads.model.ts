// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const businessAds = sequelizeClient.define('business_ads', {
    bid: {
      type: DataTypes.STRING,
      allowNull: false
    },

    owner: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    description: {
      type: DataTypes.STRING,
      allowNull: false
    },

    imageSource: {
      type: DataTypes.STRING,
      allowNull: false
    },

    positions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false
    },

    to: {
      type: DataTypes.STRING,
      allowNull: false
    },

    reviewed: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },

  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (businessAds as any).associate = function (models: any): void {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
  };

  return businessAds;
}
