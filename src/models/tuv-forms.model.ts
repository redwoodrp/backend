// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const tuvForms = sequelizeClient.define('tuv_forms', {
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    discordName: {
      type: DataTypes.STRING,
      allowNull: false
    },

    licensePlate: {
      type: DataTypes.STRING,
    },

    firstRegistry: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    vehicleBrand: {
      type: DataTypes.STRING,
      allowNull: false
    },

    vehicleModel: {
      type: DataTypes.STRING,
      allowNull: false
    },

    engineType: {
      type: DataTypes.STRING,
      allowNull: false
    },

    engineHorsepower: {
      type: DataTypes.NUMBER,
      allowNull: false
    },

    engineCCM: {
      type: DataTypes.NUMBER,
      allowNull: false
    },

    fuelType: {
      type: DataTypes.STRING,
      allowNull: false
    },

    transmission: {
      type: DataTypes.STRING,
      allowNull: false
    },

    bodyType: {
      type: DataTypes.STRING,
      allowNull: false
    },

    vehicleColor: {
      type: DataTypes.STRING,
      allowNull: false
    },

    vehicleWeight: {
      type: DataTypes.NUMBER,
      allowNull: false
    },

    vehicleSeatsAmount: {
      type: DataTypes.NUMBER,
      allowNull: false
    },

    vehicleYear: {
      type: DataTypes.STRING,
      allowNull: false
    },

    additionalInfos: {
      type: DataTypes.STRING,
      allowNull: true
    },

    tid: {
      type: DataTypes.UUIDV4,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any): HookReturn {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (tuvForms as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return tuvForms;
}
