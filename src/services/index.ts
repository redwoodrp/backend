import { Application } from '../declarations';
import users from './users/users.service';
import storedForms from './stored-forms/stored-forms.service';
import tuvForms from './tuv-forms/tuv-forms.service';
import approveTuv from './approve-tuv/approve-tuv.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(storedForms);
  app.configure(tuvForms);
  app.configure(approveTuv);
}
