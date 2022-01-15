// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const botConfig = sequelizeClient.define('bot_config', {
    guildId: {
      type: DataTypes.STRING,
      allowNull: false
    },

    startBalance: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    commandRestrictions: {
      type: DataTypes.JSONB,
      allowNull: false
    },

    // Stored as follows: { channel: '#...', min: 2, max: 8 }
    chatMoney: {
      type: DataTypes.JSONB,
      allowNull: false
    },

    auditLogChannel: {
      type: DataTypes.STRING,
    },

    // { role: id, amount: 1000, cooldown: 3600 }
    moneyRoles: {
      type: DataTypes.JSONB,
      allowNull: false
    },

    // {
    //   work: {
    //     min: 800,
    //     max: 1500,
    //     cooldown: 3600,
    //   },
    //   slut: {
    //     min: 800,
    //     max: 1500,
    //     cooldown: 3600,
    //   },
    //   [...]
    // }
    commandSettings: {
      type: DataTypes.JSONB,
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
  (botConfig as any).associate = function (models: any): void {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
  };

  return botConfig;
}
