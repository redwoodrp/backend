import Discord, { CategoryChannel, DiscordAPIError, Guild, GuildChannel, Intents, Snowflake, User } from 'discord.js';
import TuvFormData from '../interfaces/tuvForms';
import Canvas, { registerFont } from 'canvas';
import app from '../app';
import { DriversLicenseClass, DriversLicenseWithSignature } from '../interfaces/driversLicense';
import axios from 'axios';
import { ChannelTypes } from 'discord.js/typings/enums';
import fs, { promises as fsp } from 'fs';
import Logger from './helpers/logger';
import { BeamMPServer, Client, PlayerCount, PlayerCountChannel, RefreshChannelInterval } from './helpers/interfaces';
import CommandHandler from './helpers/handler';

export default class DiscordBot {
  public client = new Discord.Client({
    intents: [
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.DIRECT_MESSAGE_TYPING,
      Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    ],
    partials: ['CHANNEL', 'MESSAGE', 'REACTION', 'USER', 'GUILD_MEMBER'],
  }) as Client;
  public playerCountCategory: PlayerCount | null = null;

  private token = app.get('discord-token');
  private refreshChannel: RefreshChannelInterval = { refreshTime: 30_000, interval: null };
  public guild: Guild | null = null;
  logger = new Logger(true);
  private commandHandler = new CommandHandler(this.client, this.logger);

  constructor () {
    this.client.on('ready', async () => {
      this.logger.log(`Logged in as ${this.client.user?.tag}!`);
      this.playerCountCategory = await this.loadPlayerCountFile();

      this.client.class = this;

      try {
        this.guild = await this.client.guilds.fetch(await app.get('discord-guild'));

        this.client.commands = new Discord.Collection();
        this.commandHandler.registerAll('bot/commands').catch((err) => {
          throw new Error(err);
        });

        this.client.on('messageCreate', (message: Discord.Message) => {
          this.commandHandler.handle(message);
        });
      } catch (e) {
        this.logger.log(e);
        throw e;
      }


      // Refresh player count channels
      // this.refreshChannel.interval = setInterval(async () => await this.refreshPlayerCount(this.refreshChannel), this.refreshChannel.refreshTime) as unknown as number;
      // await this.refreshPlayerCount(this.refreshChannel);
    });
  }

  public async loadPlayerCountFile (): Promise<PlayerCount | null> {
    const fileName = 'playercount.json';
    const baseDir = 'config';
    const path = `${baseDir}/${fileName}`;

    if (!fs.existsSync(path)) throw new Error(`File ${fileName} (${path}) not found!`);

    try {
      const buffer = await fsp.readFile(path);
      if (!buffer) return null;

      return JSON.parse(buffer.toString()) as PlayerCount;
    } catch (e) {
      this.logger.log(`Error while reading ${path}.`, e);
      return null;
    }
  }

  public async savePlayerCountData (data: PlayerCount): Promise<void> {
    if (!data) return;

    const fileName = 'playercount.json';
    const baseDir = 'config';
    const path = `${baseDir}/${fileName}`;

    try {
      await fsp.writeFile(path, JSON.stringify(data, null, 2));
      this.playerCountCategory = data;
    } catch (e) {
      this.logger.log('An error occurred while trying to write to the ', fileName, 'file.', e);
    }
  }

  public async createPlayerCountChannel (name: string, position: number, category: CategoryChannel): Promise<GuildChannel | null> {
    if (!this.guild) return null;

    return await this.guild.channels.create(name, {
      position,
      type: ChannelTypes.GUILD_VOICE,
      parent: category,
      reason: 'Created Player Count Channels',
      topic: 'Here you can see the amount of players online on one of our servers.',
      userLimit: 0,
      permissionOverwrites: [{
        id: this.guild.roles.everyone.id,
        type: 'role',
        deny: ['CONNECT'],
      }]
    });
  }

  public async refreshPlayerCount (interval?: RefreshChannelInterval): Promise<void> {
    if (interval) this.logger.log(`Refreshing channels now. (every ${interval.refreshTime / 1000}secs)`);

    try {
      if (!this.playerCountCategory) return;
      if (!this.guild) return;
      const category = await this.guild.channels.fetch(this.playerCountCategory.id) as CategoryChannel;
      if (category.type !== 'GUILD_CATEGORY') throw new Error(`Category channel is not of type GUILD_CATEGORY (!== ${category.type})`);

      // Get data from BeamMP
      const url = 'https://backend.beammp.com/servers-info';
      const res = await axios.get(url);
      if (!res) return;

      let sortIndex = -1;
      const servers = (res.data as BeamMPServer[]).filter(s => s.owner === 'vlad maksimenko#1337').sort(() => sortIndex++);
      if (!servers) return;

      // category.children.forEach(c => c.delete('Cleaning Player count category'));

      let realIndex = -1;
      const playerCountChannels = await Promise.all(this.playerCountCategory.channels.map(async ({
        _comment,
        id,
        name,
        port,
        placeholder
      }, i) => {
        if (!this.guild) return;

        if (placeholder) {
          let channel: GuildChannel | null = null;
          if (id) {
            try {
              channel = await this.guild.channels.fetch(id);
            } catch (e) {
              if ((e as DiscordAPIError).httpStatus === 404) {
                channel = await this.createPlayerCountChannel(name, i, category);
              }
            }
          } else channel = await this.createPlayerCountChannel(name, i, category);

          if (!channel) return;
          return {
            id: channel.id,
            name,
            placeholder: true,
          };
        }

        realIndex++;

        let newName: string;
        if (servers.length - 1 > realIndex) newName = name.replace('{p}', servers[realIndex].players);
        else newName = 'Server unavailable';

        let channel: GuildChannel | null = null;
        if (id) {
          try {
            channel = await this.guild.channels.fetch(id);
          } catch (e) {
            if ((e as DiscordAPIError).httpStatus === 404) {
              channel = await this.createPlayerCountChannel(newName, i, category);
            }
          }
          if (!channel) return;

          await channel.setName(newName);
        } else {
          channel = await this.createPlayerCountChannel(newName, i, category);
        }

        if (!channel) return;
        const data = {
          id: channel.id,
          name,
          port
        } as PlayerCountChannel;

        if (_comment) data._comment = _comment;
        return data;
      })) as PlayerCountChannel[];

      if (typeof playerCountChannels === 'undefined') return;
      await this.savePlayerCountData({
        id: this.playerCountCategory.id,
        channels: playerCountChannels,
      });
    } catch (e) {
      this.logger.log(e);
      throw e;
    }
  }

  public async login (): Promise<void> {
    try {
      await this.client.login(this.token);
    } catch (e) {
      this.logger.log('Unable to login...', e);
    }
  }

  public calculateCategory (weight: number, wheels: number): string {
    if (weight < 3500) {
      if (wheels === 4) return 'B';
    }
    return 'B';
  }

  public async generateTUV (data: TuvFormData): Promise<Buffer> {
    // Image manipulation starts
    const background = await Canvas.loadImage('./src/bot/assets/tuv-template.jpg');
    registerFont('./src/bot/assets/NanumPenScript-Regular.ttf', { family: 'nanumpen' });

    const canvas = Canvas.createCanvas(background.width, background.height);
    const context = canvas.getContext('2d');

    context.font = '22px Arial';

    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    interface TUVFormPrint extends TuvFormData {
      signature: string;
      expiresIn: string;
      category: string;
    }

    const vehicle: TUVFormPrint = {
      ...data,
      signature: data.inspector?.split('#')[0] || 'unknown',
      expiresIn: new Date((new Date(data.firstRegistry ?? '')).setMonth((new Date(data.firstRegistry ?? '')).getMonth() + 1)).toDateString(),
      category: this.calculateCategory(data.vehicleWeight, 4),
    };

    const ownerUser = await this.client.users.fetch(vehicle.owner);
    vehicle.owner = this.getFullUsername(ownerUser);

    // Draw text
    const currentY = [[192, 377], [116, 596, 705, 341]]; // initialize with start pos
    const xMap = [[223, 139], [864, 660, 893, 1091]];
    const tables = [
      [
        [vehicle.licensePlate, new Date(vehicle.firstRegistry ?? '').toDateString(), vehicle.expiresIn, vehicle.vehicleBrand, vehicle.vehicleModel],
        ['1111', vehicle.owner, 's', 's', 's', 's', 's', vehicle.owner],
      ],
      [
        [vehicle.bodyType, 's', 's', vehicle.vehicleWeight, 's', new Date().toDateString(), vehicle.category, 's', vehicle.engineCCM, vehicle.vehicleColor, 's', vehicle.vehicleSeatsAmount.toString()],
        [vehicle.additionalInfos],
        [{ label: vehicle.signature, font: '70px "nanumpen"' }],
        [vehicle.engineHorsepower, 's', vehicle.fuelType],
      ],
    ];

    tables.forEach((table, tableIndex) => {
      table.forEach((arr, arrIndex) => {
        let y = currentY[tableIndex][arrIndex];
        arr.forEach((key) => {
          context.font = '22px Arial';
          if (typeof key === 'object') {
            if (key?.font) context.font = key.font;
            if (key?.label) context.fillText(key?.label ?? '', xMap[tableIndex][arrIndex], y); // s = skip
          } else if (key !== 's') {
            context.fillText(key.toString(), xMap[tableIndex][arrIndex], y); // s = skip
          }

          y += 37; // 37 = table height
        });
      });
    });

    return canvas.toBuffer('image/jpeg', { quality: 0.5, progressive: false, chromaSubsampling: true, });
  }

  public async generateDriversLicense (data: DriversLicenseWithSignature): Promise<Buffer> {
    const user: User = await this.client.users.fetch(data.owner);
    if (!user) throw new Error('User not found');

    const background = await Canvas.loadImage('./src/bot/assets/drivers-license-template.jpg');

    const regex = /^data:.+\/(.+);base64,(.*)$/;
    const matches = data.signature.match(regex);
    if (!matches) throw new Error('Bad signature');
    const signature = await Canvas.loadImage(Buffer.from(matches[2], 'base64'));

    registerFont('./src/bot/assets/Poppins-Medium.ttf', { family: 'poppins' });


    const canvas = Canvas.createCanvas(background.width, background.height);
    const ctx = canvas.getContext('2d');

    ctx.font = '19px poppins'; // Issued + Instructor

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.fillText(data.issued, 464, 218);
    ctx.fillText(data.instructor, 850, 218);

    ctx.font = '22px poppins'; // table
    ctx.textAlign = 'center';

    ctx.fillText(data.discordName, 180, 523);

    ctx.font = '19px poppins';

    let classes = data.classes;
    if (typeof (data.classes as string | DriversLicenseClass[]) === 'string') classes = data.classes as DriversLicenseClass[];
    this.logger.log('classes', classes);

    ctx.fillText(classes.includes('A') ? 'Yes' : 'No', 539, 279);
    ctx.fillText(classes.includes('A1') ? 'Yes' : 'No', 539, 279 + 32);
    ctx.fillText(classes.includes('B') ? 'Yes' : 'No', 539, 279 + 32 * 2);
    ctx.fillText(classes.includes('C') ? 'Yes' : 'No', 539, 279 + 32 * 3);
    ctx.fillText(classes.includes('C1') ? 'Yes' : 'No', 539, 279 + 32 * 4);
    ctx.fillText(classes.includes('D') ? 'Yes' : 'No', 539, 279 + 32 * 5);

    ctx.drawImage(signature, 359, 509, 720, 140);

    ctx.beginPath();
    ctx.arc(181, 392, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const profilePicture = await Canvas.loadImage(user.displayAvatarURL({ format: 'jpeg' }));
    ctx.drawImage(profilePicture, 81, 292, 200, 200);

    return canvas.toBuffer('image/jpeg', { quality: 0.9, progressive: false, chromaSubsampling: true, });
  }

  public getFullUsername (user: User): string {
    return `${user.username}#${user.discriminator}`;
  }

  public async sendMessage (userId: Snowflake, message: string): Promise<void> {
    try {
      const user = await this.client.users.fetch(userId);
      if (!user) return;

      await user.send(message);
      this.logger.log(`Message '${message}' sent to ${user.username}.`);
    } catch (e) {
      throw e as Error;
    }
  }
}
