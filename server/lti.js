/**
 * LTI 1.3 Integration Module
 *
 * Implements the IMS Global LTI 1.3 / LTI Advantage specification:
 *  - OIDC Login Initiation
 *  - JWT-based launch validation
 *  - JWKS endpoint for platform key verification
 *  - Deep Linking (Content-Item Message)
 *  - Assignment & Grade Services (AGS) for grade passback
 *  - Names and Role Provisioning Services (NRPS)
 */

import { exportJWK, generateKeyPair, SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LTI_DATA_DIR = path.join(__dirname, 'data');
const LTI_CONFIG_FILE = path.join(LTI_DATA_DIR, 'lti-platforms.json');
const LTI_KEYS_FILE = path.join(LTI_DATA_DIR, 'lti-keys.json');
const LTI_NONCES_FILE = path.join(LTI_DATA_DIR, 'lti-nonces.json');

// ── Persistent Storage Helpers ──────────────────────────────────

function ensureDir() {
  if (!fs.existsSync(LTI_DATA_DIR)) fs.mkdirSync(LTI_DATA_DIR, { recursive: true });
}

function readJSON(filePath, fallback) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); }
  catch { return fallback; }
}

function writeJSON(filePath, data) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Key Management ──────────────────────────────────────────────

let _toolKeyPair = null;
let _toolJWK = null;
let _toolKid = null;

async function getToolKeyPair() {
  if (_toolKeyPair) return { privateKey: _toolKeyPair.privateKey, publicKey: _toolKeyPair.publicKey, kid: _toolKid };

  const stored = readJSON(LTI_KEYS_FILE, null);
  if (stored?.privateKey && stored?.publicKey) {
    const { importJWK } = await import('jose');
    _toolKeyPair = {
      privateKey: await importJWK(stored.privateKey, 'RS256'),
      publicKey: await importJWK(stored.publicKey, 'RS256'),
    };
    _toolKid = stored.kid;
    return { privateKey: _toolKeyPair.privateKey, publicKey: _toolKeyPair.publicKey, kid: _toolKid };
  }

  const { privateKey, publicKey } = await generateKeyPair('RS256');
  _toolKeyPair = { privateKey, publicKey };
  _toolKid = uuidv4();

  const privJWK = await exportJWK(privateKey);
  const pubJWK = await exportJWK(publicKey);
  writeJSON(LTI_KEYS_FILE, { privateKey: { ...privJWK, kid: _toolKid }, publicKey: { ...pubJWK, kid: _toolKid }, kid: _toolKid });

  return { privateKey, publicKey, kid: _toolKid };
}

// ── Platform Registration CRUD ──────────────────────────────────

function getPlatforms() {
  return readJSON(LTI_CONFIG_FILE, []);
}

function savePlatforms(platforms) {
  writeJSON(LTI_CONFIG_FILE, platforms);
}

function getPlatformByIssuer(issuer, clientId) {
  const normalized = normalizeIssuer(issuer);
  return getPlatforms().find(p => normalizeIssuer(p.issuer) === normalized && p.clientId === clientId) || null;
}

function getPlatformById(id) {
  return getPlatforms().find(p => p.id === id) || null;
}

function normalizeIssuer(issuer) {
  return String(issuer || '').trim().replace(/\/+$/, '');
}

function normalizeRoles(roles = []) {
  const unique = new Set();
  for (const raw of (Array.isArray(roles) ? roles : [])) {
    const role = String(raw || '').trim();
    if (role) unique.add(role);
  }
  return [...unique];
}

function roleFlags(roles) {
  const list = normalizeRoles(roles);
  const has = (needle) => list.some(r => r.toLowerCase().includes(needle));
  return {
    isInstructor: has('instructor') || has('administrator') || has('teachingassistant'),
    isStudent: has('learner') || has('student'),
    isObserver: has('observer'),
    normalizedRoles: list,
  };
}

// ── Nonce Management (replay prevention) ────────────────────────

function storeNonce(nonce, expiresIn = 600) {
  const nonces = readJSON(LTI_NONCES_FILE, {});
  nonces[nonce] = Date.now() + expiresIn * 1000;
  const now = Date.now();
  for (const [k, v] of Object.entries(nonces)) {
    if (v < now) delete nonces[k];
  }
  writeJSON(LTI_NONCES_FILE, nonces);
}

function verifyNonce(nonce) {
  const nonces = readJSON(LTI_NONCES_FILE, {});
  if (!nonces[nonce]) return false;
  if (nonces[nonce] < Date.now()) { delete nonces[nonce]; writeJSON(LTI_NONCES_FILE, nonces); return false; }
  delete nonces[nonce];
  writeJSON(LTI_NONCES_FILE, nonces);
  return true;
}

// In-memory state store for OIDC flow
const oidcStates = new Map();

function cleanExpiredStates() {
  const now = Date.now();
  for (const [key, val] of oidcStates) {
    if (val.expires < now) oidcStates.delete(key);
  }
}

// ── Express Router ──────────────────────────────────────────────

export function createLTIRouter(express, { requireAdminForPlatformWrites } = {}) {
  const router = express.Router();
  router.use(express.json({ type: ['application/json', 'text/plain'] }));
  router.use(express.urlencoded({ extended: true }));
  const requireLTIAdmin = typeof requireAdminForPlatformWrites === 'function'
    ? requireAdminForPlatformWrites
    : ((req, res, next) => next());

  // ─── JWKS Endpoint ───────────────────────────────────────────
  // Platforms fetch our public key to verify messages we sign
  router.get('/jwks', async (req, res) => {
    try {
      const { publicKey, kid } = await getToolKeyPair();
      const jwk = await exportJWK(publicKey);
      res.json({
        keys: [{ ...jwk, kid, alg: 'RS256', use: 'sig' }],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── OIDC Login Initiation ───────────────────────────────────
  // Step 1: Platform redirects here. We redirect back with auth request.
  router.all('/login', (req, res) => {
    try {
      const params = { ...req.query, ...req.body };
      const { iss, login_hint, target_link_uri, lti_message_hint, client_id } = params;

      if (!iss || !login_hint) {
        return res.status(400).send('Missing required OIDC parameters (iss, login_hint).');
      }

      const normalizedIss = normalizeIssuer(iss);
      const platform = getPlatformByIssuer(normalizedIss, client_id);
      if (!platform) {
        return res.status(403).send(`Platform not registered. Issuer: ${normalizedIss}, Client ID: ${client_id}`);
      }

      const state = uuidv4();
      const nonce = uuidv4();

      storeNonce(nonce);
      oidcStates.set(state, {
        platformId: platform.id,
        nonce,
        expires: Date.now() + 600000,
      });
      cleanExpiredStates();

      const toolUrl = target_link_uri || `${req.protocol}://${req.get('host')}/api/lti/launch`;

      const authParams = new URLSearchParams({
        scope: 'openid',
        response_type: 'id_token',
        client_id: platform.clientId,
        redirect_uri: toolUrl,
        login_hint,
        state,
        response_mode: 'form_post',
        nonce,
        prompt: 'none',
      });
      if (lti_message_hint) authParams.set('lti_message_hint', lti_message_hint);

      const authUrl = `${platform.authorizationEndpoint}?${authParams.toString()}`;
      res.redirect(302, authUrl);
    } catch (err) {
      console.error('LTI login error:', err);
      res.status(500).send('LTI login initiation failed.');
    }
  });

  // ─── Launch Endpoint (callback) ──────────────────────────────
  // Step 2: Platform posts id_token here after OIDC auth
  router.post('/launch', async (req, res) => {
    try {
      const { id_token, state } = req.body;
      if (!id_token || !state) {
        return res.status(400).send('Missing id_token or state in LTI launch.');
      }

      const stateData = oidcStates.get(state);
      if (!stateData) {
        return res.status(403).send('Invalid or expired state. Please try launching again.');
      }
      oidcStates.delete(state);

      const platform = getPlatformById(stateData.platformId);
      if (!platform) {
        return res.status(403).send('Platform configuration not found.');
      }

      // Verify the JWT
      let payload;
      try {
        if (platform.jwksEndpoint) {
          const jwks = createRemoteJWKSet(new URL(platform.jwksEndpoint));
          const result = await jwtVerify(id_token, jwks, {
            issuer: platform.issuer,
            audience: platform.clientId,
          });
          payload = result.payload;
        } else {
          // Fallback: decode without verification (dev mode)
          const parts = id_token.split('.');
          payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
          console.warn('LTI: No JWKS endpoint configured - token NOT cryptographically verified (dev mode).');
        }
      } catch (verifyErr) {
        console.error('LTI JWT verification failed:', verifyErr.message);
        return res.status(403).send('JWT verification failed: ' + verifyErr.message);
      }

      // Validate LTI message type
      const messageType = payload['https://purl.imsglobal.org/spec/lti/claim/message_type'];
      if (messageType !== 'LtiResourceLinkRequest' && messageType !== 'LtiDeepLinkingRequest') {
        return res.status(400).send('Unsupported LTI message type: ' + messageType);
      }

      const deploymentId = payload['https://purl.imsglobal.org/spec/lti/claim/deployment_id'];
      if (platform.deploymentId && deploymentId && String(platform.deploymentId) !== String(deploymentId)) {
        return res.status(403).send(`Deployment mismatch. Expected ${platform.deploymentId}, got ${deploymentId}`);
      }

      // Verify nonce
      if (!verifyNonce(payload.nonce || stateData.nonce)) {
        console.warn('LTI: Nonce verification failed (may be replay or expired).');
      }

      // Extract LTI context
      const context = payload['https://purl.imsglobal.org/spec/lti/claim/context'] || {};
      const roles = payload['https://purl.imsglobal.org/spec/lti/claim/roles'] || [];
      const custom = payload['https://purl.imsglobal.org/spec/lti/claim/custom'] || {};
      const resourceLink = payload['https://purl.imsglobal.org/spec/lti/claim/resource_link'] || {};
      const ags = payload['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'] || null;
      const nrps = payload['https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'] || null;
      const deepLinking = payload['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'] || null;
      const { isInstructor, isStudent, isObserver, normalizedRoles } = roleFlags(roles);
      const contextId = context.id || custom.classId || payload['https://purl.imsglobal.org/spec/lti/claim/target_link_uri'] || '';
      const contextTitle = context.title || custom.className || 'LTI Course';

      // Create a session token for our app
      const { privateKey, kid } = await getToolKeyPair();
      const sessionToken = await new SignJWT({
        sub: payload.sub,
        name: payload.name || payload.given_name || 'LTI User',
        email: payload.email || '',
        roles: normalizedRoles,
        isInstructor,
        isStudent,
        isObserver,
        platformId: platform.id,
        platformName: platform.name,
        deploymentId: deploymentId || platform.deploymentId || '1',
        contextId,
        contextTitle,
        resourceLinkId: resourceLink.id || '',
        ags: ags ? { lineItemUrl: ags.lineitems, lineItemId: ags.lineitem, scopes: ags.scope } : null,
        nrps: nrps ? { contextMembershipsUrl: nrps.context_memberships_url, serviceVersions: nrps.service_versions } : null,
        custom,
      })
        .setProtectedHeader({ alg: 'RS256', kid })
        .setIssuedAt()
        .setExpirationTime('8h')
        .setIssuer('quantegy-ai')
        .sign(privateKey);

      // Handle Deep Linking requests
      if (messageType === 'LtiDeepLinkingRequest' && deepLinking) {
        return res.send(buildDeepLinkingPage(sessionToken, deepLinking, platform, req));
      }

      // Regular resource link launch - redirect to app with session
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const launchUrl = new URL('/lti-launch', baseUrl);
      launchUrl.searchParams.set('token', sessionToken);
      if (custom.route) launchUrl.searchParams.set('route', custom.route);

      // Set headers to allow iframe embedding
      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Security-Policy', "frame-ancestors *;");

      res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Launching Quantegy AI...</title></head>
<body>
<script>window.location.href = ${JSON.stringify(launchUrl.toString())};</script>
<noscript><a href="${launchUrl.toString()}">Click here to continue</a></noscript>
</body></html>`);
    } catch (err) {
      console.error('LTI launch error:', err);
      res.status(500).send('LTI launch failed: ' + err.message);
    }
  });

  // ─── Deep Linking Response ───────────────────────────────────
  router.post('/deep-link-response', async (req, res) => {
    try {
      const { items, returnUrl, platformId, deploymentId } = req.body;
      const platform = getPlatformById(platformId);
      if (!platform) return res.status(404).json({ error: 'Platform not found.' });

      const { privateKey, kid } = await getToolKeyPair();
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const contentItems = (items || []).map(item => ({
        type: 'ltiResourceLink',
        title: item.title,
        text: item.description || '',
        url: `${baseUrl}/api/lti/launch`,
        custom: {
          route: item.route || '/teacher-dashboard',
          classId: item.classId || '',
          gameId: item.gameId || '',
        },
        lineItem: item.lineItem ? {
          scoreMaximum: item.lineItem.scoreMaximum || 100,
          label: item.title,
          resourceId: item.resourceId || uuidv4(),
        } : undefined,
      }));

      const jwt = await new SignJWT({
        iss: platform.clientId,
        aud: [platform.issuer],
        nonce: uuidv4(),
        'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
        'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
        'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': contentItems,
        'https://purl.imsglobal.org/spec/lti/claim/deployment_id': deploymentId || platform.deploymentId || '1',
      })
        .setProtectedHeader({ alg: 'RS256', kid })
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(privateKey);

      res.json({ success: true, jwt, returnUrl });
    } catch (err) {
      console.error('Deep linking response error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Grade Passback (AGS) ────────────────────────────────────
  router.post('/grade-passback', async (req, res) => {
    try {
      const { platformId, lineItemUrl, studentSub, score, maxScore, comment, activityProgress, gradingProgress } = req.body;
      const platform = getPlatformById(platformId);
      if (!platform) return res.status(404).json({ error: 'Platform not found.' });

      const accessToken = await getAGSAccessToken(platform);
      if (!accessToken) return res.status(500).json({ error: 'Failed to obtain AGS access token.' });

      const scorePayload = {
        userId: studentSub,
        scoreGiven: score,
        scoreMaximum: maxScore || 100,
        comment: comment || '',
        timestamp: new Date().toISOString(),
        activityProgress: activityProgress || 'Completed',
        gradingProgress: gradingProgress || 'FullyGraded',
      };

      const scoreUrl = lineItemUrl.endsWith('/scores') ? lineItemUrl : `${lineItemUrl}/scores`;
      const response = await fetch(scoreUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.ims.lis.v1.score+json',
        },
        body: JSON.stringify(scorePayload),
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `AGS score post failed: ${errText}` });
      }

      res.json({ success: true, message: 'Score posted to LMS.' });
    } catch (err) {
      console.error('Grade passback error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Names & Roles (NRPS) ───────────────────────────────────
  router.post('/roster', async (req, res) => {
    try {
      const { platformId, contextMembershipsUrl } = req.body;
      const platform = getPlatformById(platformId);
      if (!platform) return res.status(404).json({ error: 'Platform not found.' });

      const accessToken = await getAGSAccessToken(platform, [
        'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
      ]);
      if (!accessToken) return res.status(500).json({ error: 'Failed to obtain NRPS access token.' });

      const response = await fetch(contextMembershipsUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.ims.lti-nrps.v2.membershipcontainer+json',
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `NRPS request failed: ${errText}` });
      }

      const data = await response.json();
      res.json({ success: true, members: data.members || [] });
    } catch (err) {
      console.error('NRPS error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Platform Registration CRUD ──────────────────────────────
  router.get('/platforms', (req, res) => {
    const platforms = getPlatforms().map(p => ({
      ...p,
      clientSecret: undefined, // never expose secrets
    }));
    res.json({ success: true, platforms });
  });

  router.post('/platforms', requireLTIAdmin, (req, res) => {
    try {
      const { name, issuer, clientId, deploymentId, authorizationEndpoint, tokenEndpoint, jwksEndpoint, accessTokenUrl } = req.body;
      if (!name || !issuer || !clientId) {
        return res.status(400).json({ error: 'name, issuer, and clientId are required.' });
      }
      const normalizedIssuer = normalizeIssuer(issuer);
      if (!/^https?:\/\//i.test(normalizedIssuer)) {
        return res.status(400).json({ error: 'issuer must be a valid URL starting with http(s)://' });
      }

      const platforms = getPlatforms();
      const existing = platforms.find(p => p.issuer === normalizedIssuer && p.clientId === clientId);
      if (existing) {
        return res.status(409).json({ error: 'Platform with this issuer + clientId already registered.' });
      }

      const platform = {
        id: uuidv4(),
        name,
        issuer: normalizedIssuer,
        clientId,
        deploymentId: deploymentId || '1',
        authorizationEndpoint: authorizationEndpoint || `${normalizedIssuer}/api/lti/authorize_redirect`,
        tokenEndpoint: tokenEndpoint || accessTokenUrl || `${normalizedIssuer}/login/oauth2/token`,
        jwksEndpoint: jwksEndpoint || `${normalizedIssuer}/api/lti/security/jwks`,
        createdAt: new Date().toISOString(),
        active: true,
      };

      platforms.push(platform);
      savePlatforms(platforms);
      res.json({ success: true, platform });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/platforms/:id', requireLTIAdmin, (req, res) => {
    try {
      const platforms = getPlatforms();
      const idx = platforms.findIndex(p => p.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Platform not found.' });
      const patch = { ...req.body };
      if (patch.issuer) patch.issuer = normalizeIssuer(patch.issuer);
      platforms[idx] = { ...platforms[idx], ...patch, id: platforms[idx].id };
      savePlatforms(platforms);
      res.json({ success: true, platform: platforms[idx] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/platforms/:id', requireLTIAdmin, (req, res) => {
    const platforms = getPlatforms().filter(p => p.id !== req.params.id);
    savePlatforms(platforms);
    res.json({ success: true });
  });

  // ─── Configuration Info (for admins setting up LTI in their LMS)
  router.get('/config', async (req, res) => {
    try {
      const { kid } = await getToolKeyPair();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      res.json({
        success: true,
        config: {
          toolName: 'Quantegy AI',
          description: 'AI-powered math learning platform with games, assessments, and analytics',
          targetLinkUri: `${baseUrl}/api/lti/launch`,
          oidcInitiationUrl: `${baseUrl}/api/lti/login`,
          jwksUrl: `${baseUrl}/api/lti/jwks`,
          deepLinkingUrl: `${baseUrl}/api/lti/launch`,
          redirectUris: [`${baseUrl}/api/lti/launch`],
          domain: req.get('host'),
          customParameters: {
            route: 'The app route to open (e.g. /teacher-dashboard, /games/math-sprint)',
            classId: 'Optional class ID to open directly',
            gameId: 'Optional game ID for direct game launch',
          },
          scopes: [
            'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
            'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
            'https://purl.imsglobal.org/spec/lti-ags/scope/score',
            'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
          ],
          placements: [
            { type: 'course_navigation', label: 'Quantegy AI Math' },
            { type: 'assignment_selection', label: 'Quantegy AI Activity' },
            { type: 'editor_button', label: 'Embed Quantegy AI' },
          ],
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Verify session token ────────────────────────────────────
  router.post('/verify-token', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ error: 'Token required.' });
      const { publicKey } = await getToolKeyPair();
      const { payload } = await jwtVerify(token, publicKey, { issuer: 'quantegy-ai' });
      res.json({ success: true, user: payload });
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired session token.' });
    }
  });

  return router;
}

// ── AGS Access Token (OAuth 2.0 Client Credentials) ─────────────

async function getAGSAccessToken(platform, scopes) {
  if (!platform.tokenEndpoint) return null;

  const { privateKey, kid } = await getToolKeyPair();
  const clientAssertion = await new SignJWT({
    sub: platform.clientId,
    iss: platform.clientId,
    aud: platform.tokenEndpoint,
    jti: uuidv4(),
  })
    .setProtectedHeader({ alg: 'RS256', kid })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey);

  const defaultScopes = [
    'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
    'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
    'https://purl.imsglobal.org/spec/lti-ags/scope/score',
  ];

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    client_assertion: clientAssertion,
    scope: (scopes || defaultScopes).join(' '),
  });

  try {
    const response = await fetch(platform.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      console.error('AGS token request failed:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (err) {
    console.error('AGS token error:', err.message);
    return null;
  }
}

// ── Deep Linking Page Builder ───────────────────────────────────

function buildDeepLinkingPage(sessionToken, deepLinkingSettings, platform, req) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Quantegy AI - Select Content</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; padding: 24px; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  p.sub { color: #64748b; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .card { background: #fff; border-radius: 12px; padding: 20px; border: 2px solid #e2e8f0; cursor: pointer; transition: all 0.2s; }
  .card:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.15); }
  .card.selected { border-color: #2563eb; background: #eff6ff; }
  .card h3 { font-size: 16px; margin-bottom: 4px; }
  .card p { font-size: 13px; color: #64748b; }
  .card .icon { font-size: 28px; margin-bottom: 8px; }
  .actions { margin-top: 24px; display: flex; gap: 12px; }
  .btn { padding: 12px 24px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; }
  .btn-primary { background: #2563eb; color: #fff; }
  .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
  .btn-secondary { background: #fff; color: #475569; border: 1px solid #cbd5e1; }
</style>
</head>
<body>
<h1>Select Content to Add</h1>
<p class="sub">Choose activities to embed in your course from Quantegy AI.</p>
<div class="grid" id="items">
  <div class="card" data-route="/teacher-dashboard" data-title="Teacher Dashboard" data-desc="Full AI-powered teacher dashboard with analytics and copilot">
    <div class="icon">📊</div><h3>Teacher Dashboard</h3><p>Full dashboard with AI analytics, copilot, and class management</p>
  </div>
  <div class="card" data-route="/games/math-sprint" data-title="Math Sprint" data-desc="Timed math drill game aligned to TEKS" data-game="math-sprint" data-scored="true">
    <div class="icon">⚡</div><h3>Math Sprint</h3><p>Fast-paced timed math drills aligned to TEKS standards</p>
  </div>
  <div class="card" data-route="/games/math-match" data-title="Math Match" data-desc="Memory matching game for math concepts" data-game="math-match" data-scored="true">
    <div class="icon">🃏</div><h3>Math Match</h3><p>Memory-based matching game for equations and concepts</p>
  </div>
  <div class="card" data-route="/games/q-blocks" data-title="Q-Blocks" data-desc="Spatial reasoning math game" data-game="q-blocks" data-scored="true">
    <div class="icon">🧱</div><h3>Q-Blocks</h3><p>Spatial reasoning and problem-solving game</p>
  </div>
  <div class="card" data-route="/games/fraction-pizza" data-title="Fraction Pizza" data-desc="Interactive fraction learning game" data-game="fraction-pizza" data-scored="true">
    <div class="icon">🍕</div><h3>Fraction Pizza</h3><p>Interactive fraction building and comparison</p>
  </div>
  <div class="card" data-route="/staar-prep" data-title="STAAR Prep" data-desc="STAAR test preparation and practice">
    <div class="icon">📝</div><h3>STAAR Prep</h3><p>Comprehensive STAAR test preparation with practice exams</p>
  </div>
  <div class="card" data-route="/student" data-title="Student Portal" data-desc="Student learning hub with personalized pathway">
    <div class="icon">🎓</div><h3>Student Portal</h3><p>Personalized learning hub with AI tutor and progress tracking</p>
  </div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="addBtn" disabled>Add Selected Items</button>
  <button class="btn btn-secondary" onclick="window.close()">Cancel</button>
</div>
<script>
  const selected = new Set();
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      const route = card.dataset.route;
      selected.has(route) ? selected.delete(route) : selected.add(route);
      document.getElementById('addBtn').disabled = selected.size === 0;
    });
  });

  document.getElementById('addBtn').addEventListener('click', async () => {
    const items = [];
    document.querySelectorAll('.card.selected').forEach(card => {
      const item = { title: card.dataset.title, description: card.dataset.desc, route: card.dataset.route };
      if (card.dataset.game) item.gameId = card.dataset.game;
      if (card.dataset.scored) item.lineItem = { scoreMaximum: 100 };
      items.push(item);
    });

    const resp = await fetch('${baseUrl}/api/lti/deep-link-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        returnUrl: ${JSON.stringify(deepLinkingSettings.deep_link_return_url)},
        platformId: ${JSON.stringify(platform.id)},
        deploymentId: ${JSON.stringify(platform.deploymentId || '1')},
      }),
    });
    const data = await resp.json();
    if (data.success) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.returnUrl;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'JWT';
      input.value = data.jwt;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    }
  });
</script>
</body></html>`;
}
