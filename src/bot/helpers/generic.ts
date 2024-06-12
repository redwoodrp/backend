import { Snowflake } from 'discord.js';
import { BotConfig } from './interfaces';
import app from '../../app';

export async function getBotConfig(guild: Snowflake): Promise<BotConfig> {
  const query = {
    $limit: 1,
    guildId: guild,
  };

  const configs = await app.service('bot-config').find({ query }) as BotConfig[];
  if (configs.length === 0) {
    console.log(`[DiscordBot] Guild ${guild} doesn't have a bot-config yet. Creating one for it`);

    await app.service('bot-config').create({
      guildId: guild,
      chatMoney: [],
      commandRestrictions: [],
      moneyRoles: [],
      auditLogChannel: null,
      commandSettings: {
        work: {
          cooldown: 3600,
          min: 800,
          max: 1500,
        },
        slut: {
          min: 1000,
          max: 4000,
          fineAmount: {
            min: 800,
            max: 8000,
          },
          cooldown: 3600,
          fineChance: 0.4,
        },
      },
      startBalance: 5000,
    } as BotConfig);

    return (await app.service('bot-config').find({ query }) as BotConfig[])[0];
  }
  return configs[0];
}
