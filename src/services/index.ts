import { Application } from '../declarations';
import users from './users/users.service';
import tuvForms from './tuv-forms/tuv-forms.service';
import approveTuv from './approve-tuv/approve-tuv.service';
import feedback from './feedback/feedback.service';
import unbelievaBoat from './unbelieva-boat/unbelieva-boat.service';
import driversLicense from './drivers-license/drivers-license.service';
import driversLicenseRequest from './drivers-license-request/drivers-license-request.service';
import business from './business/business.service';
import businessRequest from './business-request/business-request.service';
import businessAds from './business-ads/business-ads.service';
import verifyPaymentAccount from './verify-payment-account/verify-payment-account.service';
import wallet from './wallet/wallet.service';
import botConfig from './bot-config/bot-config.service';
import discordLastExecuted from './discord-last-executed/discord-last-executed.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(tuvForms);
  app.configure(approveTuv);
  app.configure(feedback);
  app.configure(unbelievaBoat);
  app.configure(driversLicense);
  app.configure(driversLicenseRequest);
  app.configure(business);
  app.configure(businessRequest);
  app.configure(businessAds);
  app.configure(verifyPaymentAccount);
  app.configure(wallet);
  app.configure(botConfig);
  app.configure(discordLastExecuted);
}
