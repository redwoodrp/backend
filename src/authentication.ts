import {OAuthProfile, OAuthStrategy} from '@feathersjs/authentication-oauth';
import { AuthenticationRequest, AuthenticationResult } from '@feathersjs/authentication';
import axios, {AxiosRequestConfig} from 'axios';
import {AuthenticationService, JWTStrategy} from '@feathersjs/authentication';
import {LocalStrategy} from '@feathersjs/authentication-local';
import {expressOauth} from '@feathersjs/authentication-oauth';
import {Application} from './declarations';

interface Profile {
  id: number;
  avatar: string;
  discordId: number;
  username: string;
  discriminator: string;
  avatarURI: string;
  verified: boolean;
  mfa_enabled: boolean;
  locale: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function (app: Application) {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  authentication.register('discord', new DiscordStrategy());

  app.use('/authentication', authentication);
  app.configure(expressOauth());
}

export class DiscordStrategy extends OAuthStrategy {
  async getProfile(authResult: AuthenticationRequest) {
    // This is the OAuth access token that can be used
    // for Discord API requests as the Bearer token
    const accessToken = authResult.access_token;
    const userOptions: AxiosRequestConfig = {
      method: 'GET',
      headers: {'Authorization': `Bearer ${accessToken}`},
      url: 'https://discord.com/api/users/@me',
    };
    const {data} = await axios(userOptions);
    return data;
  }
  // async getRedirect (authResult: AuthenticationResult) {
  //   const { user } = authResult;
  //   console.log(user);
  //   return 'http://localhost:8080/login/?access_token=success';
  // }

  async getEntityData(profile: Profile) {
    // `profile` is the data returned by getProfile
    const baseData = await super.getEntityData(profile, null, {});

    if (profile.avatar == null) {
      profile.avatar = 'https://cdn.discordapp.com/embed/avatars/0.png';
    } else {
      const isGif = profile.avatar.startsWith('a_');
      profile.avatar = `https://cdn.discordapp.com/avatars/${profile['id']}/${profile['avatar']}.${isGif ? 'gif' : 'png'}`;
    }

    console.log('Profile: ', profile);
    console.log('Basedata: ', baseData);

    return {
      ...baseData,
      username: profile.username,
      email: profile.email,
      avatarURI: profile.avatar,
      discriminator: profile.discriminator,
      verified: profile.verified,
      mfaEnabled: profile.mfa_enabled,
      locale: profile.locale,
    };
  }
}
