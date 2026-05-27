/**
 * Extracts the Bearer token from an AMIS redirect URL.
 *
 * Expected URL format:
 *   https://amis.uplb.edu.ph/personal-information/?token=10442313%7CyifpOkPPWXMo0F0aHXPSKeXMPlz0trZ2t6pU1yp4&session_id=...
 *
 * The `token` query param is URL-encoded — `%7C` is `|`.
 * The decoded token becomes: `10442313|yifpOkPPWXMo0F0aHXPSKeXMPlz0trZ2t6pU1yp4`
 *
 * @param {string} amisUrl - The full AMIS URL copied from the browser address bar.
 * @returns {{ token: string, sessionId: string | null }} The extracted credentials.
 * @throws {Error} If the URL doesn't contain a valid token parameter.
 */
export function extractCredentialsFromUrl(amisUrl) {
  const trimmed = amisUrl.trim();

  // If the user pasted just a raw token (no URL), return it directly
  if (!trimmed.startsWith('http')) {
    return { token: trimmed, sessionId: null };
  }

  try {
    const url = new URL(trimmed);
    const token = url.searchParams.get('token');
    const sessionId = url.searchParams.get('session_id');

    if (!token) {
      throw new Error('No "token" parameter found in the URL.');
    }

    // URL.searchParams.get() automatically decodes %7C → |
    return { token, sessionId };
  } catch (err) {
    if (err.message.includes('token')) throw err;
    throw new Error('Invalid URL format. Please paste the full AMIS address bar URL.');
  }
}

/**
 * Fetches grades from the AMIS API using a Bearer token.
 *
 * Mirrors the working approach from test.js:
 *   - Only `Authorization: Bearer <token>` is required
 *   - The response body is a ReadableStream that must be decoded chunk-by-chunk
 *   - No x-session-id header is needed
 *
 * @param {string} bearerToken - The raw token value (without the "Bearer " prefix).
 * @returns {Promise<object>} The parsed JSON grades data.
 */
export async function fetchAmisGrades(bearerToken) {
  const response = await fetch('/api-proxy/api/students/grades?summarize=true', {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Authorization': `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`AMIS API returned status ${response.status}: ${response.statusText}`);
  }

  // The AMIS API returns a ReadableStream body.
  // We must consume it chunk-by-chunk with a TextDecoder, matching test.js behavior.
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  // Flush the decoder
  result += decoder.decode();

  try {
    return JSON.parse(result);
  } catch {
    throw new Error('Failed to parse AMIS response as JSON. The token may have expired.');
  }
}
