import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'quantegy-ai-jwt-secret-change-in-production-' + Date.now();

export function createSSORouter(express, signToken) {
  const router = express.Router();

  const isConfigured = (envVar, demoPlaceholder) => {
    const v = process.env[envVar];
    return !!v && v !== demoPlaceholder;
  };

  // Real Google OAuth client IDs end with .apps.googleusercontent.com — never redirect with placeholder or invalid ID
  const isValidGoogleClientId = (id) =>
    typeof id === 'string' &&
    id.length > 10 &&
    !id.includes('demo') &&
    id.endsWith('.apps.googleusercontent.com');

  // Google OAuth - return OAuth URL only when a valid GOOGLE_CLIENT_ID is set (avoid "OAuth client was not found")
  router.get('/auth/google', (req, res) => {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!isValidGoogleClientId(clientId)) {
        return res.status(503).json({
          error: 'Google sign-in is not configured for this server.',
          configured: false,
          hint: 'In .env set GOOGLE_CLIENT_ID and optionally OAUTH_REDIRECT_BASE_URL (e.g. http://localhost:4173). In Google Console add this exact Authorized redirect URI: ' + (process.env.OAUTH_REDIRECT_BASE_URL || `${req.protocol}://${req.get('host') || 'localhost:3001'}`).replace(/\/$/, '') + '/api/sso/callback/google',
        });
      }
      // Use OAUTH_REDIRECT_BASE_URL if set (avoids redirect_uri_mismatch when app is behind proxy, e.g. Vite 4173 → API 3001)
      const baseUrl = process.env.OAUTH_REDIRECT_BASE_URL || `${req.protocol}://${req.get('host') || req.hostname || 'localhost:3001'}`;
      const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/sso/callback/google`;
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline`;
      res.json({ url, provider: 'google' });
    } catch (err) {
      console.error('[SSO] /auth/google error:', err);
      res.status(500).json({ error: err.message || 'SSO configuration error' });
    }
  });

  // Microsoft OAuth
  router.get('/auth/microsoft', (req, res) => {
    try {
      if (!isConfigured('MICROSOFT_CLIENT_ID', 'demo-microsoft-client-id')) {
        return res.status(503).json({
          error: 'Microsoft sign-in is not configured for this server.',
          configured: false,
        });
      }
      const clientId = process.env.MICROSOFT_CLIENT_ID;
      const baseUrl = process.env.OAUTH_REDIRECT_BASE_URL || `${req.protocol}://${req.get('host') || req.hostname || 'localhost:3001'}`;
      const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/sso/callback/microsoft`;
      const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`;
      res.json({ url, provider: 'microsoft' });
    } catch (err) {
      console.error('[SSO] /auth/microsoft error:', err);
      res.status(500).json({ error: err.message || 'SSO configuration error' });
    }
  });

  // Clever OAuth
  router.get('/auth/clever', (req, res) => {
    try {
      if (!isConfigured('CLEVER_CLIENT_ID', 'demo-clever-client-id')) {
        return res.status(503).json({
          error: 'Clever sign-in is not configured for this server.',
          configured: false,
        });
      }
      const clientId = process.env.CLEVER_CLIENT_ID;
      const baseUrl = process.env.OAUTH_REDIRECT_BASE_URL || `${req.protocol}://${req.get('host') || req.hostname || 'localhost:3001'}`;
      const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/sso/callback/clever`;
      const url = `https://clever.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&district_id=`;
      res.json({ url, provider: 'clever' });
    } catch (err) {
      console.error('[SSO] /auth/clever error:', err);
      res.status(500).json({ error: err.message || 'SSO configuration error' });
    }
  });

  // OAuth callbacks — in production, exchange code for tokens and fetch user profile.
  // For demo/prototype, create a local session with a generated username.
  for (const provider of ['google', 'microsoft', 'clever']) {
    router.get(`/callback/${provider}`, (req, res) => {
      const { code } = req.query;
      const demoUser = {
        username: `${provider}_user_${Date.now()}`,
        email: `user@${provider}.com`,
        provider,
        role: 'teacher',
      };
      const token = signToken({ username: demoUser.username, role: demoUser.role, provider });
      res.redirect(`/teacher?sso_token=${token}&sso_provider=${provider}&sso_user=${encodeURIComponent(demoUser.username)}`);
    });
  }

  // List available SSO providers and their configuration status (Google only "configured" when client ID is valid)
  router.get('/providers', (req, res) => {
    res.json({
      providers: [
        { id: 'google', name: 'Google', configured: isValidGoogleClientId(process.env.GOOGLE_CLIENT_ID), color: '#4285f4' },
        { id: 'microsoft', name: 'Microsoft', configured: isConfigured('MICROSOFT_CLIENT_ID', 'demo-microsoft-client-id'), color: '#00a4ef' },
        { id: 'clever', name: 'Clever', configured: isConfigured('CLEVER_CLIENT_ID', 'demo-clever-client-id'), color: '#4274f6' },
      ],
    });
  });

  return router;
}
