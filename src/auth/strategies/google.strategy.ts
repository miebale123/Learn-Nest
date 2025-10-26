import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const clientID =
      '67636493013-veaqaoq9vet1sf0m9prs0oft9o96vom1.apps.googleusercontent.com';
    const clientSecret = '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';
    const callbackURL = 'http://localhost:4442/auth/google/callback';

    if (!clientID || !clientSecret) {
      throw new Error('Google client ID and secret not found');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, emails } = profile;

    return {
      provider: 'google',
      providerId: id,
      email: emails?.[0]?.value,
      accessToken,
    };
  }
}
