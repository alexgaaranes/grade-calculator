# Extension Conversion Plan

This plan outlines the steps to convert the 'uplb-grade-calculator' into a Chrome/Firefox extension (Manifest V3) that automatically captures the AMIS token.

## 1. Extension Manifest (`public/manifest.json`)
Create a Manifest V3 file defining the extension's metadata and permissions.
- **Permissions**: `webRequest`, `storage`.
- **Host Permissions**: `https://api-amis.uplb.edu.ph/*`, `https://amis.uplb.edu.ph/*`.
- **Action**: Set `index.html` as the default popup.
- **Background**: Define a service worker for token sniffing.

## 2. Background Service Worker (`src/background.js`)
Implement the network sniffer to capture the `Authorization` header.
- Use `chrome.webRequest.onBeforeSendHeaders` to listen to outgoing requests to `api-amis.uplb.edu.ph`.
- Extract the Bearer token.
- Store the token in `chrome.storage.local`.

## 3. UI Integration (`src/App.jsx` & Components)
Update the React application to work seamlessly in an extension environment.
- **Data Persistence**: Migrate from `localStorage` to `chrome.storage.local` to ensure data is shared correctly between the background script and the popup.
- **Token Awareness**: Update `App.jsx` and `ConnectView.jsx` to automatically detect the token from `chrome.storage.local`.
- **Auto-Sync**: When a new token is captured by the background script, the popup should reactively refresh its data.

## 4. Build Configuration (`vite.config.js`)
Adjust the build process to generate the extension structure.
- Ensure the background script is bundled separately.
- Manage asset paths for the extension context.
- Handle Content Security Policy (CSP) requirements for extensions.

## 5. Deployment & Testing
- Load the `dist` folder into Chrome/Firefox for validation.
- Verify token capture by logging into the AMIS portal.
- Test data persistence and GWA calculations in the popup.

---
**Approval Needed**: Please confirm if I should proceed with this implementation.
