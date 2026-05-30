/**
 * Background Service Worker for Tres-Hold Extension
 * 
 * This script monitors network requests to the AMIS API to capture the 
 * Authorization token automatically.
 */

const AMIS_API_URL = "https://api-amis.uplb.edu.ph/api/students/grades";

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    // 1. Capture Headers from any AMIS API request
    if (details.url.includes("api-amis.uplb.edu.ph")) {
      const authHeader = details.requestHeaders.find(
        (header) => header.name.toLowerCase() === "authorization"
      );
      const sessionHeader = details.requestHeaders.find(
        (header) => header.name.toLowerCase() === "x-session-id"
      );

      const updates = {};
      if (authHeader && authHeader.value.toLowerCase().startsWith("bearer ")) {
        updates.amis_captured_token = authHeader.value.slice(7).trim();
      }
      if (sessionHeader) {
        updates.amis_captured_session_id = sessionHeader.value;
      }

      if (Object.keys(updates).length > 0) {
        chrome.storage.local.set(updates);
      }
    }

    return { requestHeaders: details.requestHeaders };
  },
  { urls: ["https://api-amis.uplb.edu.ph/*"] },
  ["requestHeaders", "extraHeaders"]
);

console.log("Tres-Hold background worker initialized.");
