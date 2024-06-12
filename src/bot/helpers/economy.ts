import { BotConfig, CommandLastExecuted, NullableWallet, Wallet } from './interfaces';
import app from '../../app';
import { Snowflake } from 'discord.js';
import { getBotConfig } from './generic';

/**
 * Get a wallet out of the db
 * @param user the user the wallet belongs to. Can be multiple users!
 */
export async function getWallet(user: string | string[]): Promise<Wallet[]> {
  const users = Array.isArray(user) ? user : [user];

  const storedWallets = await app.service('wallet').find({
    $sort: {
      total: -1,
    },
  }) as Wallet[];

  const stored = (storedWallets.map((w, i) => {
    if (users.includes(w.user)) {
      return {
        ...w,
        leaderboard: i + 1,
      };
    }
    return null;
  }) as Wallet[]).filter(w => w !== null);
  if (!stored) return [];
  return stored;
}

/**
 * Extends the `getWallet()` function. Get a wallet => if not exists: create one and return that
 * @param user user/s to get/create the wallets for/from
 * @param guildId id of the guild
 */
export async function getAndCreateWallet(user: string | string[], guildId: Snowflake): Promise<Wallet[]> {
  const users = Array.isArray(user) ? user : [user];
  const guildConfig = await getBotConfig(guildId);
  const storedWallets: Wallet[] = await getWallet(users);

  console.log(storedWallets, users);

  if (storedWallets.length === 0) {
    users.map(async (id) => {
      await app.service('wallet').create({
        user: id,
        bank: guildConfig.startBalance,
        cash: 0,
        total: guildConfig.startBalance,
      } as Wallet);
    });
    return await getWallet(users);
  }
  return storedWallets;
}

/**
 * Add th, rd, st or nd to a number
 * @param num
 */
export function makeOrdinal(num: number): string {
  const n = num.toString();

  if (n.endsWith('11') || n.endsWith('12') || n.endsWith('13')) return `${n}th`;
  else if (n.endsWith('1')) return `${n}st`;
  else if (n.endsWith('2')) return `${n}nd`;
  else if (n.endsWith('3')) return `${n}rd`;

  return `${n}th`;
}


export function numberToCashString(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(num);
}

export async function changeBalance(changeBank: boolean, amount: number, userId: Snowflake, guildId: Snowflake): Promise<void> {
  const wallet: Wallet = (await getAndCreateWallet(userId, guildId))[0];
  if (!wallet) return;

  const data = {
    total: wallet.bank + wallet.cash + amount,
  } as NullableWallet;

  data[changeBank ? 'bank' : 'cash'] = wallet[changeBank ? 'bank' : 'cash'] + amount;

  await app.service('wallet').patch(wallet.id || -1, data);
}

export async function getCoolDownStatus(commandName: string, userId: Snowflake, guildConfig: BotConfig, removeEntries = true): Promise<{
  active: boolean,
  expires: number | null
}> {
  const lastExecutedEntries = (await app.service('discord-last-executed').find({
    query: {
      user: userId,
      command: commandName,
    },
  }) as CommandLastExecuted[]);

  if (lastExecutedEntries.length >= 1) {
    const cmdSettings = guildConfig.commandSettings[commandName as 'crime'];
    if (!cmdSettings) throw new Error('guildconfig err');

    const now = new Date();
    const withCoolDown = new Date(lastExecutedEntries[0].lastExecuted).getTime() + 1000 * cmdSettings.cooldown;
    if (withCoolDown > now.getTime()) {
      return {
        active: true,
        expires: Math.ceil((withCoolDown - now.getTime()) / 1000 / 60),
      };
    }

    if (removeEntries) {
      lastExecutedEntries.map(async e => {
        await app.service('discord-last-executed').remove(e.id);
      });
    }
  }

  return {
    active: false,
    expires: null,
  };
}
