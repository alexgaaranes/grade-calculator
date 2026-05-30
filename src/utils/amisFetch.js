/**
 * Environment detection helper.
 */
export const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;

/**
 * Extracts the Bearer token from user input.
 *
 * @param {string} input - The token string.
 * @returns {string} The cleaned Bearer token.
 */
export function extractToken(input) {
  let decoded = decodeURIComponent(input.trim());

  if (decoded.includes('token=')) {
    try {
      const tokenMatch = decoded.match(/token=([^&]+)/);
      if (tokenMatch && tokenMatch[1]) {
        decoded = tokenMatch[1];
      }
    } catch (e) {
      // fallback
    }
  }

  if (decoded.toLowerCase().startsWith('bearer ')) {
    decoded = decoded.slice(7).trim();
  }

  if (!decoded || !decoded.includes('|')) {
    throw new Error('Invalid AMIS token format.');
  }

  return decoded;
}

/**
 * Fetches grades from the AMIS API.
 *
 * @param {string} bearerToken - The raw token value.
 * @param {string} sessionId - Optional X-Session-Id header value.
 * @returns {Promise<object>} The parsed JSON grades data.
 */
export async function fetchAmisGrades(bearerToken, sessionId) {
  const baseUrl = 'https://api-amis.uplb.edu.ph';
  
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
    throw new Error(`AMIS API returned status ${response.status}`);
  }

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
    throw new Error('Failed to parse AMIS grades response.');
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
  const baseUrl = 'https://api-amis.uplb.edu.ph';

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
