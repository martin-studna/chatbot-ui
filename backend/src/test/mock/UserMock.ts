import { IUser } from '../../interface/IUser';

export class UserMock implements IUser {
  givenName = 'Biff';
  surname = 'Biffus';
  mail = 'biff@mail.com';
  displayName = 'Biff Biffus';
  country: string;
  department: string;
  jobTitle: string;
  mobilePhone: string;
  officeLocation: string;
  preferredLanguage: string;
  userPrincipalName: string;
  id: string;

  toPlainObj(): {} {
    return Object.assign({}, this);
  }
}
