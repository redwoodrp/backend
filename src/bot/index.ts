import { Client, Intents, Snowflake, User } from 'discord.js';
import TuvFormData from '../interfaces/tuvForms';
import Canvas, { registerFont } from 'canvas';
import app from '../app';
import DriversLicense, {
  DriversLicenseClass,
  DriversLicenseRequest,
  DriversLicenseWithSignature
} from '../interfaces/driversLicense';

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
    if (typeof (data.classes as string | DriversLicenseClass[]) === 'string') classes = (data.classes as unknown as string).split(',') as DriversLicenseClass[];
    console.log('classes', classes);

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
      console.log(`[DiscordBot] Message '${message}' sent to ${user.username}.`);
    } catch (e) {
      throw e as Error;
    }
  }
}
