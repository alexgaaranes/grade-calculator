# 🎓 UPLB AMIS Grade Calculator & Latin Honors Predictor

A secure, local-first web application for **University of the Philippines Los Baños (UPLB)** students to calculate GWA, simulate future grades, and predict Latin Honors eligibility in real-time.

---

## ✨ Features

- **⚡ Direct AMIS Connection**: Paste your secure Bearer token to fetch grades directly from the AMIS API.
- **🛡️ Local-First & Private**: Your academic data and tokens are processed and stored locally in your browser (`localStorage`). No external servers are used.
- **📊 GWA & Latin Honors Predictor**: Real-time GWA tracking compared against UPLB Latin honors criteria (checks for disqualifiers like `5.00`, `INC`, or `DRP`).
- **🎯 What-If Simulator**: Predict target grades needed in remaining courses to graduate with honors.
- **📝 Course Exclusions**: Easily toggle non-academic subjects (e.g. PE, NSTP) to see their impact on your GWA.

---

## 🔒 How to Connect Your AMIS Data

Since the official AMIS API resides behind secure campus endpoints, the application provides two methods to connect your data:

### Method A: Bearer Token (Recommended)

#### Option 1: Clipboard Console Script (Easiest)
1. Log in to the [AMIS Portal](https://amis.uplb.edu.ph/) in another browser tab.
2. Press `F12` (or right-click -> **Inspect**) and click the **Console** tab.
3. Paste the following script and press **Enter** to copy the token to your clipboard:
   ```javascript
   let t="";Object.keys(localStorage).concat(Object.keys(sessionStorage)).forEach(k=>{const v=localStorage.getItem(k)||sessionStorage.getItem(k);if(v&&v.includes("|"))t=v});if(t){copy(t);console.log("Token copied!")}
   ```
4. Paste the token into the **Bearer Token** input field in the app, then click **Fetch and Connect**.

#### Option 2: DevTools Network Tab
1. Log in to the [AMIS Portal](https://amis.uplb.edu.ph/).
2. Open DevTools (`F12`) and select the **Network** tab.
3. Reload the page, click on any `api-amis.uplb.edu.ph` request, and find the `Authorization` header in the **Headers** pane.
4. Copy the token starting with `Bearer ...` and paste it into the **Bearer Token** input field in the app.

### Method B: Manual JSON Upload
If the direct API fetch fails, you can download your grades as a file:
1. Log in to the [AMIS Portal](https://amis.uplb.edu.ph/).
2. Open DevTools (`F12`) and click the **Console** tab.
3. Run this script to download `amis-grades.json`:
   ```javascript
   fetch("https://api-amis.uplb.edu.ph/api/students/grades?summarize=true", { credentials: "include" })
     .then(r => r.text()).then(t => {
       const b = new Blob([t], { type: "application/json" });
       const a = document.createElement("a"); a.href = URL.createObjectURL(b);
       a.download = "amis-grades.json"; a.click();
     });
   ```
4. Upload the downloaded `amis-grades.json` file in the **Upload JSON File** tab.

---

## 📐 Academic Rules (UPLB)

- **Summa Cum Laude**: GWA $\le$ `1.2000`
- **Magna Cum Laude**: GWA $\le$ `1.4500`
- **Cum Laude**: GWA $\le$ `1.7500`
- **Disqualifiers**: A grade of `5.00`, an unremoved `INC`, or `DRP` flags a warning in the Latin Honors check.
- **Default Exclusions**: Physical Education (`PE`/`HK`) and NSTP courses are excluded from GWA calculations.

---

## 🚀 Getting Started

To run the application locally:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)

### 2. Setup & Installation
```bash
# Install dependencies
npm install

# Run the local development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) to view the application.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for details.
