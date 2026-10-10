# SecureGate AI — Standalone Frontend (React 19 + Vite + TypeScript)

This is the independent frontend workspace for **SecureGate AI — Artifact Registry with Vulnerability Scanning Gates**. You can open this folder directly in Visual Studio Code.

---

## 🚀 How to Run in VS Code

### Step 1: Open in VS Code
Open VS Code, select **File &rarr; Open Folder...**, and select the `frontend/` folder:
```bash
code frontend
```

### Step 2: Install Dependencies
Open the built-in terminal in VS Code (`Ctrl + \`` or `Cmd + \``) and run:
```bash
npm install
```

### Step 3: Start the Development Server
```bash
npm run dev
```

The frontend will start at:
👉 **`http://localhost:5173`** (or your assigned Vite port)

---

## 🔌 Connecting to the Backend

The frontend is configured with a built-in proxy in `vite.config.ts`:
- By default, requests to `/api/*` are forwarded to `http://localhost:8080` (the Spring Boot backend) or `http://localhost:3000`.
- To customize the backend URL, create a `.env` file from `.env.example`:
  ```env
  VITE_BACKEND_URL=http://localhost:8080
  ```

### 💡 Standalone / Offline Mode
If you run `npm run dev` **without** the backend running, the frontend automatically falls back to built-in simulation mode. You can test all pages, dashboards, charts, vulnerability filters, and policy simulator without needing to install MySQL or Java first!

---

## 📁 Folder Structure

```
frontend/
├── package.json          # Node dependencies & npm scripts
├── vite.config.ts        # Vite configuration with @ path alias & API proxy
├── tsconfig.json         # TypeScript compiler options
├── index.html            # HTML entry point with Plus Jakarta Sans & dark theme
├── .env.example          # Environment template
└── src/
    ├── main.tsx          # React 19 root entry
    ├── App.tsx           # Main application routing and navigation state
    ├── index.css         # Tailwind CSS styling and custom scrollbars
    ├── types/            # TypeScript data models (Scans, Policies, Registries)
    ├── services/         # API client with proxy & offline fallback
    ├── components/       # Reusable components (TopNav, Sidebar)
    └── pages/            # 10 DevSecOps Pages:
        ├── DashboardPage.tsx             # Executive Security Dashboard
        ├── RegistryExplorerPage.tsx      # Google Artifact Registry Explorer
        ├── VulnerabilityScannerPage.tsx  # Trivy Multi-Stage Scanner
        ├── SecurityGateCenterPage.tsx    # Security Gate & Policy Simulator
        ├── PipelineCenterPage.tsx        # CI/CD Visual Stage Runner
        ├── DeploymentCenterPage.tsx      # Cloud Run Immutable Digest Deployment
        ├── ScanReportsPage.tsx           # Historical Scans & Comparison
        ├── StorageInsightsPage.tsx       # Registry FinOps & Storage
        ├── AuditLogsPage.tsx             # Append-Only Security Audit Logs
        └── SettingsPage.tsx              # Cloud Config & Diagnostics Probe
```

---

## 🛠 Available Scripts

- `npm run dev`: Starts the local Vite development server.
- `npm run build`: Compiles TypeScript and creates optimized production assets in `dist/`.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Validates TypeScript types across all source files.
