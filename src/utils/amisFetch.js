/**
 * Extracts the Bearer token from user input.
 *
 * Accepts any of these formats:
 *   - "Bearer 10442414|xhdghBMzLo7CN2Gu9lDdcx8Byp6e2f9yyHf0RQvj"
 *   - "10442414|xhdghBMzLo7CN2Gu9lDdcx8Byp6e2f9yyHf0RQvj"
 *
 * @param {string} input - The token string pasted by the user.
 * @returns {string} The cleaned Bearer token (without the "Bearer " prefix).
 * @throws {Error} If the input is empty or doesn't look like a valid token.
 */
export function extractToken(input) {
  let decoded = decodeURIComponent(input.trim());

  // Check if it is a URL/link containing the token
  if (decoded.includes('token=')) {
    try {
      const tokenMatch = decoded.match(/token=([^&]+)/);
      if (tokenMatch && tokenMatch[1]) {
        decoded = tokenMatch[1];
      }
    } catch (e) {
      // fallback to input
    }
  }

  // Strip "Bearer " prefix if the user included it
  if (decoded.toLowerCase().startsWith('bearer ')) {
    decoded = decoded.slice(7).trim();
  }

  // Basic sanity check — AMIS tokens contain a pipe separator
  if (!decoded || !decoded.includes('|')) {
    throw new Error('Invalid format. Expected a Bearer token or an AMIS redirect link containing a token.');
  }

  return decoded;
}

/**
 * Fetches grades from the AMIS API using a Bearer token and optional session ID.
 *
 * @param {string} bearerToken - The raw token value (without the "Bearer " prefix).
 * @param {string} sessionId - Optional X-Session-Id header value.
 * @returns {Promise<object>} The parsed JSON grades data.
 */
export async function fetchAmisGrades(bearerToken, sessionId) {
  // Use the real API URL in production extension, or proxy in development web
  const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
  const baseUrl = isExtension ? 'https://api-amis.uplb.edu.ph' : '/api-proxy';
  
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Authorization': `Bearer ${bearerToken}`,
    'Origin': 'https://amis.uplb.edu.ph',
    'Referer': 'https://amis.uplb.edu.ph/',
  };

  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await fetch(`${baseUrl}/api/students/grades?summarize=true`, {
    method: 'GET',
    headers: headers,
  });

  if (!response.ok) {
    throw new Error(`AMIS API returned status ${response.status}: ${response.statusText}`);
  }

  // The AMIS API returns a ReadableStream body.
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  result += decoder.decode();

  try {
    return JSON.parse(result);
  } catch {
    throw new Error('Failed to parse AMIS grades response as JSON.');
  }
}

/**
 * Fetches authenticated user information.
 * 
 * @param {string} bearerToken - The raw token value.
 * @param {string} sessionId - Optional X-Session-Id header value.
 * @returns {Promise<object>} The user auth data.
 */
export async function fetchAmisAuthUser(bearerToken, sessionId) {
  const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
  const baseUrl = isExtension ? 'https://api-amis.uplb.edu.ph' : '/api-proxy';

  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Authorization': `Bearer ${bearerToken}`,
    'Origin': 'https://amis.uplb.edu.ph',
    'Referer': 'https://amis.uplb.edu.ph/',
  };

  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await fetch(`${baseUrl}/api/auth/user`, {
    method: 'GET',
    headers: headers,
  });

  if (!response.ok) {
    throw new Error(`AMIS Auth API returned status ${response.status}`);
  }

  return response.json();
}
