# Technical Plan: Web & Extension Synchronization

This plan outlines the strategy to sync the improvements from the browser extension version back to the deployed web version, ensuring a single codebase maintains both platforms.

## 1. Core Objectives
- **Single Codebase**: Maintain one set of components that work on both Web and Extension.
- **Environment Awareness**: The app must detect if it's running as an extension or a standalone website.
- **Feature Parity**: Bring the enhanced What-If simulator and Auth Profile mapping to the web.
- **Deployment Safety**: Ensure the web version remains functional despite lacking extension-only features (like network sniffing).

## 2. Technical Architecture Changes

### A. Environment Detection & Storage Abstraction
We will implement a standard utility or hook to handle storage.
- **Extension**: Uses `chrome.storage.local` (async, cross-script persistence).
- **Web**: Uses `localStorage` (sync, standard web storage).
- **Strategy**: Update `App.jsx` to gracefully switch between these based on `typeof chrome !== 'undefined'`.

### B. "Hybrid" Connect View
The "Connect" screen is the biggest point of divergence.
- **Extension Mode**: Keep the "AMIS Sync Ready" Zap banner (Automatic Sniffing).
- **Web Mode**: Restore the **Manual Token Input** and **JSON Paste** options. Since websites cannot sniff headers from other domains, users on the web version will still need the clipboard script or manual entry.
- **Shared**: Both modes will use the new `auth/user` profile mapping for rich student data.

### C. Fetching & Proxy Logic
- **Extension Mode**: Continues to fetch directly from `api-amis.uplb.edu.ph` using `host_permissions`.
- **Web Mode**: Must use the `/api-proxy` configured in Vite/Vercel to bypass CORS.
- **Update**: Standardize `amisFetch.js` to select the `baseUrl` based on the environment.

### D. CSS & Layout (Responsive Hybrid)
- **Extension**: Fixed 400x600px dimensions.
- **Web**: Needs to be responsive (Mobile-first shell on Desktop, Full-screen on Mobile).
- **Strategy**: 
    - Move fixed 400x600px styles to a specific `.extension-popup` class or use `@media (display-mode: standalone)` and environment detection.
    - Ensure the "Bottom Nav" is fixed only relative to its container on the web to maintain the "Spotify Web" look.

## 3. Implementation Steps

1.  **Refactor `vite.config.js`**: Restore the proxy configuration while keeping the background script build entry point.
2.  **Update `amisFetch.js`**: Refine environment-based URL selection.
3.  **Refactor `ConnectView.jsx`**: Create a conditional UI that shows "Auto-Sync" for extensions and "Manual Entry" for Web.
4.  **Refactor `SettingsView.jsx`**: Similar to ConnectView, restore manual entry for the web version.
5.  **Adjust `index.css`**: Change the hardcoded `html`/`body` dimensions to only apply when running as a popup.
6.  **Build & Validation**:
    - `npm run build:web` (Standard build for Vercel).
    - `npm run build:ext` (Build with manifest and background worker).

---
**Approval Needed**: Should I proceed with implementing this Hybrid architecture to sync the web and extension versions?
