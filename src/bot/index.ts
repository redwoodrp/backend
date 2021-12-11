import { Client, Intents, Snowflake, User } from 'discord.js';
import TuvFormData from '../interfaces/tuvForms';
import Canvas, { registerFont } from 'canvas';
import app from '../app';

export default class DiscordBot {
  public client = new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS] });
  private token = app.get('discord-token');

  constructor () {
    this.client.on('ready', () => {
      console.log(`[DiscordBot] Logged in as ${this.client.user?.tag}!`);
    });
  }

  public async login (): Promise<void> {
    await this.client.login(this.token);
  }

  public test (): void {
    console.log('Bot test log');
  }

  public calculateCategory (weight: number, wheels: number): string {
    if (weight < 3500) {
      if (wheels === 4) return 'B';
    }
    return 'B';
  }

  public async generateImage (data: TuvFormData): Promise<Buffer> {
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
      signature: data.inspector || 'unknown',
      expiresIn: new Date((new Date(data.firstRegistry ?? '')).setMonth((new Date(data.firstRegistry ?? '')).getMonth() + 1)).toDateString(),
      category: this.calculateCategory(data.vehicleWeight, 4),
    };

    console.log(vehicle.owner);

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

  public getFullUsername (user: User): string {
    return `${user.username}#${user.discriminator}`;
  }

  public async sendMessage (userId: Snowflake, message: string): Promise<void> {
    try {
      const user = await this.client.users.fetch(userId);
      if (!user) return;

      await user.send(message);
      console.log(`[DiscordBot] Message '${message}' sent to ${user.username}.`);
    } catch (e) {
      throw e as Error;
    }
  }
}
