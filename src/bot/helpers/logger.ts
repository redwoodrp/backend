import chalk from 'chalk';

export default class Logger {
  public active = false;

  constructor(active: boolean) {
    this.active = active;
  }

  public log(message: unknown, ...args: unknown[]): void {
    if (this.active) console.log(`${chalk.blue('[DiscordBot]')}`, message, ...args);
  }
}
