# 🎓 UPLB AMIS Grade Calculator & Latin Honors Predictor

A modern, responsive, and premium web application built for **University of the Philippines Los Baños (UPLB)** students. It securely synchronizes academic records from the AMIS Portal to calculate General Weighted Average (GWA), track curriculum progress, and predict Latin Honors eligibility in real-time.

Designed with **Green Deck** aesthetics (dark-first, Spotify-inspired interfaces), featuring high-contrast layout grids, glassmorphism panel styling, interactive GWA gauges, and custom-tailored what-if grade simulators.

---

## 📸 Screenshots

### 1. Secure AMIS Connection Gate
Users can securely authenticate by pasting their AMIS redirect URL, pasting a manually copied JSON payload, or exploring the application using simulated sandbox data.

![Secure AMIS Connect Gate](./public/screenshots/connect.png)

### 2. Premium Analytics Dashboard
An interactive dashboard displaying computed GWA, current Latin Honors standing, curriculum progress indicators, and historical semester-by-semester metrics.

![Grades Analytics Dashboard](./public/screenshots/dashboard.png)

---

## ✨ Features

- **⚡ Direct AMIS Connection**: Paste your session URL from your browser address bar after logging in to extract your secure Bearer token and download records.
- **🛡️ Local-First & Private**: Your academic details, tokens, and session details are processed entirely in the browser and stored locally via `localStorage`. No data is uploaded to external servers.
- **📊 Interactive GWA Gauge**: Visualize your standing against university thresholds with a radial gauge and honor level indicators.
- **🏆 Latin Honors Eligibility**: Computes standing using official UPLB academic rules and checks eligibility against criteria rules (accounting for failed grades `5.00`, incompletes `INC`, or dropped courses `DRP`).
- **🎯 What-If Simulator**: Predict the grades you need in remaining courses to graduate with honors, featuring real-time GWA forecasting.
- **📝 Course Exclusions**: Toggle the contribution of individual courses (such as PE/HK, NSTP, and non-academic electives) to see how they impact your overall average.

---

## 🔒 How to Connect Your AMIS Data

Since the official AMIS API resides behind secure campus endpoints, the application provides two methods to connect your data:

### Method A: The AMIS Link (Recommended)
1. Log in to your [AMIS Portal](https://amis.uplb.edu.ph/) in another browser tab.
2. Copy the **entire URL** from the browser's address bar. It will look like this:
   `https://amis.uplb.edu.ph/personal-information/?token=10442313%7CyifpOkPPWX...&session_id=...`
3. Paste that link into the **AMIS Link** input tab on the connection screen and click **Fetch and Connect**.

### Method B: Manual JSON Copy-Paste
If the direct link fails or has expired, you can pull your data manually using the developer console:
1. Log in to [amis.uplb.edu.ph](https://amis.uplb.edu.ph/).
2. Open your browser's Developer Tools (`F12` or `Ctrl + Shift + I` / `Cmd + Option + I`) and click the **Console** tab.
3. Paste this script and press **Enter**:
   ```javascript
   fetch("https://api-amis.uplb.edu.ph/api/students/grades?summarize=true", {
     credentials: "include"
   })
   .then(r => r.json())
   .then(data => console.log(JSON.stringify(data)))
   ```
4. Copy the outputted JSON string, click the **JSON Payload** tab in this app, paste the JSON, and hit **Import JSON Data**.

---

## 📐 Academic Calculation Rules

Calculations follow the official guidelines set by the **University of the Philippines Los Baños**:

### 1. Latin Honors Thresholds
*   **Summa Cum Laude**: GWA $\le$ `1.2000`
*   **Magna Cum Laude**: GWA $\le$ `1.4500`
*   **Cum Laude**: GWA $\le$ `1.7500`

### 2. Disqualifying Marks
The honors calculator checks course history and flags warnings if any of the following marks are detected:
*   A grade of **`5.00`** (Fail)
*   Unremoved **`INC`** (Incomplete)
*   **`DRP`** (Dropped)

### 3. Automatically Excluded Courses
By default, non-academic courses are excluded from the GWA computation to prevent skewing GWA standings:
*   Physical Education courses (`PE 1`, `PE 2`, `HK 11`, `HK 12`, `HK 13`, etc.)
*   National Service Training Program (`NSTP 1`, `NSTP 2`)
*   Excluded courses can be toggled manually back into GWA at any time in the **Grades** view.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, Lucide Icons
- **Fonts**: DM Sans (headings, interfaces) & JetBrains Mono (monospaced credentials & JSON readouts)
- **Local Cache**: LocalStorage for student records and profile custom settings
- **Server proxying**: Vite dev server proxies request targets from `/api-proxy` to `api-amis.uplb.edu.ph` to bypass CORS security policies.

---

## 🚀 Getting Started

To run the application locally:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/uplb-grade-calculator.git
cd uplb-grade-calculator

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 4. Build for Production
```bash
npm run build
```
The compiled files will be located in the `dist/` directory.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
