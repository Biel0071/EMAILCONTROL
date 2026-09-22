import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.ts';

export interface StoredTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string;
  token_type?: string;
  expiry_date?: number | null;
  userEmail?: string;
  userName?: string;
  userPicture?: string;
}

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

class AuthService {
  private oauth2Client: any = null;
  private currentMode: 'live' | 'mock' = 'mock';

  constructor() {
    this.initOAuth();
    this.initMode();
  }

  private initOAuth() {
    if (CONFIG.hasGoogleCredentials()) {
      this.oauth2Client = new google.auth.OAuth2(
        CONFIG.GOOGLE_CLIENT_ID,
        CONFIG.GOOGLE_CLIENT_SECRET,
        CONFIG.GOOGLE_REDIRECT_URI
      );

      const tokens = this.getStoredTokens();
      if (tokens && tokens.access_token) {
        this.oauth2Client.setCredentials(tokens);
      }
    }
  }

  private initMode() {
    const tokens = this.getStoredTokens();
    if (tokens && tokens.access_token && CONFIG.hasGoogleCredentials()) {
      this.currentMode = 'live';
    } else {
      this.currentMode = 'mock';
    }
  }

  public getOAuthClient() {
    return this.oauth2Client;
  }

  public configureCredentials(clientId: string, clientSecret: string): void {
    const cleanId = clientId.trim();
    const cleanSecret = clientSecret.trim();

    CONFIG.GOOGLE_CLIENT_ID = cleanId;
    CONFIG.GOOGLE_CLIENT_SECRET = cleanSecret;
    process.env.GOOGLE_CLIENT_ID = cleanId;
    process.env.GOOGLE_CLIENT_SECRET = cleanSecret;

    // Persist to .env file
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }

      const updateOrAdd = (key: string, val: string) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${val}`);
        } else {
          envContent += `\n${key}=${val}`;
        }
      };

      updateOrAdd('PORT', CONFIG.PORT.toString());
      updateOrAdd('CLIENT_URL', CONFIG.CLIENT_URL);
      updateOrAdd('GOOGLE_CLIENT_ID', cleanId);
      updateOrAdd('GOOGLE_CLIENT_SECRET', cleanSecret);
      updateOrAdd('GOOGLE_REDIRECT_URI', CONFIG.GOOGLE_REDIRECT_URI);

      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
    } catch (err) {
      console.error('Error writing .env:', err);
    }

    this.initOAuth();
    this.initMode();
  }

  public getStoredTokens(): StoredTokens | null {
    try {
      if (fs.existsSync(CONFIG.TOKENS_FILE)) {
        const data = fs.readFileSync(CONFIG.TOKENS_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('Error reading tokens file:', err);
    }
    return null;
  }

  public saveTokens(tokens: StoredTokens): void {
    try {
      fs.writeFileSync(CONFIG.TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
      if (this.oauth2Client) {
        this.oauth2Client.setCredentials(tokens);
      }
    } catch (err) {
      console.error('Error saving tokens:', err);
    }
  }

  private mockProfile: 'personal' | 'enterprise' = 'enterprise';

  public generateAuthUrl(options: { domain?: string; loginHint?: string } = {}): string {
    if (!CONFIG.hasGoogleCredentials() || !this.oauth2Client) {
      throw new Error('Google OAuth credentials not configured in environment (.env). Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
    }

    const authConfig: any = {
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
    };

    if (options.domain && options.domain.trim()) {
      authConfig.hd = options.domain.trim();
    }
    if (options.loginHint && options.loginHint.trim()) {
      authConfig.login_hint = options.loginHint.trim();
    }

    return this.oauth2Client.generateAuthUrl(authConfig);
  }

  public async handleCallback(code: string): Promise<StoredTokens> {
    if (!this.oauth2Client) {
      this.initOAuth();
    }
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized. Check your Google credentials.');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    // Fetch user profile info
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const storedTokens: StoredTokens = {
      ...tokens,
      userEmail: userInfo.data.email || undefined,
      userName: userInfo.data.name || undefined,
      userPicture: userInfo.data.picture || undefined,
    };

    this.saveTokens(storedTokens);
    this.currentMode = 'live';
    return storedTokens;
  }

  public disconnect(): void {
    if (fs.existsSync(CONFIG.TOKENS_FILE)) {
      fs.unlinkSync(CONFIG.TOKENS_FILE);
    }
    if (this.oauth2Client) {
      this.oauth2Client.setCredentials({});
    }
    this.currentMode = 'mock';
  }

  public setMockProfile(profile: 'personal' | 'enterprise') {
    this.mockProfile = profile;
  }

  public getMockProfile(): 'personal' | 'enterprise' {
    return this.mockProfile;
  }

  public getStatus() {
    const tokens = this.getStoredTokens();
    const isAuthenticated = Boolean(tokens && (tokens.access_token || tokens.refresh_token));
    
    let email = 'deboraxavier@iusnatura.com.br';
    let name = 'Débora Xavier';

    if (this.currentMode === 'live' && isAuthenticated && tokens?.userEmail) {
      email = tokens.userEmail;
      name = tokens.userName || 'Usuário Conectado';
    } else if (this.mockProfile === 'personal') {
      email = 'usuario.pessoal@gmail.com';
      name = 'Usuário Gmail Pessoal';
    } else {
      email = 'deboraxavier@iusnatura.com.br';
      name = 'Débora Xavier';
    }

    const isPersonal = email.toLowerCase().endsWith('@gmail.com');
    const accountType: 'personal' | 'enterprise' = (this.currentMode === 'mock')
      ? this.mockProfile
      : (isPersonal ? 'personal' : 'enterprise');

    return {
      authenticated: isAuthenticated,
      hasGoogleCredentials: CONFIG.hasGoogleCredentials(),
      mode: this.currentMode,
      accountType,
      user: (this.currentMode === 'live' && isAuthenticated)
        ? {
            email,
            name,
            picture: tokens?.userPicture,
          }
        : this.currentMode === 'mock'
        ? {
            email,
            name,
            picture: undefined,
          }
        : undefined,
    };
  }

  public setMode(mode: 'live' | 'mock'): void {
    if (mode === 'live') {
      const tokens = this.getStoredTokens();
      if (!tokens || !tokens.access_token) {
        throw new Error('Cannot switch to Live Mode without active Google OAuth connection.');
      }
    }
    this.currentMode = mode;
  }

  public getMode(): 'live' | 'mock' {
    return this.currentMode;
  }
}

export const authService = new AuthService();
