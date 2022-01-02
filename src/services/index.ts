import { Application } from '../declarations';
import users from './users/users.service';
import storedForms from './stored-forms/stored-forms.service';
import tuvForms from './tuv-forms/tuv-forms.service';
import approveTuv from './approve-tuv/approve-tuv.service';
import feedback from './feedback/feedback.service';
import unbelievaBoat from './unbelieva-boat/unbelieva-boat.service';
import driversLicense from './drivers-license/drivers-license.service';
import driversLicenseRequest from './drivers-license-request/drivers-license-request.service';
import business from './business/business.service';
import businessRequest from './business-request/business-request.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(storedForms);
  app.configure(tuvForms);
  app.configure(approveTuv);
  app.configure(feedback);
  app.configure(unbelievaBoat);
  app.configure(driversLicense);
  app.configure(driversLicenseRequest);
  app.configure(business);
  app.configure(businessRequest);
}
