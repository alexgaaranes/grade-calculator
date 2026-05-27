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
  let token = input.trim();

  // Strip "Bearer " prefix if the user included it
  if (token.toLowerCase().startsWith('bearer ')) {
    token = token.slice(7).trim();
  }

  // Basic sanity check — AMIS tokens contain a pipe separator
  if (!token || !token.includes('|')) {
    throw new Error('Invalid token format. Expected something like: 10442414|xhdghBMzLo7...');
  }

  return token;
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
