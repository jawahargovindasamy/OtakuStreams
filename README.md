<div align="center">
  <img src="src/assets/Logo%20Light.png" alt="OtakuStreams Logo" width="220">
  <h1>🌸 OtakuStreams Ecosystem</h1>
  <p><strong>A state-of-the-art, feature-rich full-stack anime streaming, tracking, and discovery platform.</strong></p>
  <p>
    <a href="#1-scope-and-overview">Scope & Overview</a> •
    <a href="#2-file-and-folder-overview">File Structure</a> •
    <a href="#3-installation-and-setup">Installation</a> •
    <a href="#4-usage-and-workflows">Usage & Config</a> •
    <a href="#5-architecture-and-design">Architecture</a> •
    <a href="#6-development-and-testing">Development</a> •
    <a href="#7-deployment">Deployment</a> •
    <a href="#8-cicd-monitoring-and-security">Security & Monitoring</a> •
    <a href="#9-troubleshooting">Troubleshooting</a> •
    <a href="#10-contributing-and-contact">Contributing</a> •
    <a href="#11-license-and-credits">License</a>
  </p>
  <p>
    <img alt="React" src="https://img.shields.io/badge/React-19.0.0-blue.svg?style=flat-square&logo=react" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-5.x-purple.svg?style=flat-square&logo=vite" />
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3.x-blueviolet.svg?style=flat-square&logo=tailwind-css" />
    <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18%2B-green.svg?style=flat-square&logo=nodedotjs" />
    <img alt="Express" src="https://img.shields.io/badge/Express-4.x-black.svg?style=flat-square&logo=express" />
    <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-6%2B-brightgreen.svg?style=flat-square&logo=mongodb" />
    <img alt="Socket.io" src="https://img.shields.io/badge/Socket.io-4.x-blue.svg?style=flat-square&logo=socketdotio" />
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" />
  </p>
</div>

---

## 1) Scope and Overview

**OtakuStreams** is a modern, high-performance, full-stack streaming ecosystem built specifically for anime enthusiasts. It solves the fragmentation of media consumption by combining seamless, ad-free streaming with robust, real-time social and management capabilities. 

### Core Goals
1. **Seamless Discovery:** Instantaneous, responsive browsing of thousands of anime listings across genres, years, and production studios.
2. **Interactive Playback:** High-definition video player that lets users select high-quality streams, toggle audio tracks (Sub/Dub), and remember playback coordinates.
3. **Automated Alerts:** An intelligent background scheduler that matches airing times with user watchlists to issue instant, real-time upload notifications.
4. **Frictionless Progress Synchronization:** Tracking the user's viewing history in real-time across multiple devices so they can resume watching exactly where they left off.

### Target Users
Anime fans seeking a streamlined, premium viewing hub that goes beyond a standard player, incorporating personalized watchlists, real-time updates on currently airing episodes, and clean, responsive UI layouts.

### Tech Stack
- **Frontend Stack:**
  - **React 19:** Building a dynamic, declarative user interface.
  - **Vite:** Blazing-fast development server and highly-optimized asset bundling.
  - **Tailwind CSS & shadcn/ui:** Tailored HSL color palette, dark mode styles, custom components, and premium visual layout design.
  - **Framer Motion:** High-fidelity, hardware-accelerated animations and page transition effects.
  - **React Router v6:** Secure client-side routing and router history management.
- **Backend Stack:**
  - **Node.js & Express.js:** Scalable RESTful API development.
  - **MongoDB & Mongoose:** Schema-enforced document storage for watchlist and progress records.
  - **Socket.IO:** Real-time bi-directional WebSockets pipeline for live user notification dispatches.
  - **Node-Cron:** Precision cron scheduler for synchronization.
  - **Winston & Morgan:** Unified, structured system logging piping development streams into separate persistent files.

---

## 2) File and Folder Overview

The frontend repository follows a highly modular, component-driven architecture with clean isolation of global state and API utilities.

```
/
├── public/                 # Static assets, fallback media, and favicon icons
├── src/
│   ├── assets/             # Branding logo assets, design imagery, and media templates
│   ├── components/         # Reusable structural and visual components
│   │   ├── ui/             # Accessible, customizable components via shadcn/ui
│   │   ├── Navbar.jsx      # Navigation header with user profiles & notification bell
│   │   ├── EpisodesList.jsx# Left-hand scrolling panel for episode selection
│   │   └── EpisodeServer.js# Audio toggle (Sub/Dub) and server node switcher
│   ├── context/            # React global state providers
│   │   ├── auth-provider.jsx# Handles user state, secure login/logout, and profile changes
│   │   └── data-provider.jsx# Handles Jikan and AniList GraphQL queries and sessionStorage caching
│   ├── hooks/              # Custom React hooks for responsive logic
│   ├── lib/                # Shared utilities, classnames concatenators, and slugifiers
│   ├── pages/              # Top-level route views (17 interactive views)
│   │   ├── LandingPage.jsx # Captivating gateway introducing OtakuStreams features
│   │   ├── Home.jsx        # Personalized dashboard displaying carousels and trending shows
│   │   ├── Watch.jsx       # Dedicated streaming player, season selectors, and reviews
│   │   └── Watchlist.jsx   # Tabbed view organizing watchlists by status categories
│   ├── App.jsx             # React routing tables, global themes, and auth interceptors
│   ├── main.jsx            # Application entrypoint wrapping strict mode and providers
│   └── index.css           # Global typography, scrollbar stylings, and tailwind overrides
├── netlify/
│   └── functions/
│       └── check-episode.js# Serverless Netlify function to proxy external streaming status
├── .env.example            # Reference sheet for local environment variables
├── components.json         # shadcn/ui registry config
├── eslint.config.js        # ESLint environment rule overrides
├── netlify.toml            # Serverless deployment configuration and SPA rewrite paths
├── package.json            # Node dependency tree, version controls, and scripts
├── tailwind.config.js      # Tailwind custom theme setup, styling grids, and animations
└── vite.config.js          # Vite compilers, plugins, and module resolution aliases
```

---

## 3) Installation and Setup

### Prerequisites
- **Node.js:** `v18.x.x` or higher (Active LTS recommended)
- **npm:** `v9.x.x` or higher (or `pnpm` / `yarn`)

### Environment Setup
Create a `.env` file in the root of the project using the structure in `.env.example`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Running Locally

1. **Clone the frontend repository:**
   ```bash
   git clone https://github.com/jawahargovindasamy/OtakuStreams.git
   cd OtakuStreams
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   *The client will launch automatically at `http://localhost:5173`.*

4. **Serve netlify functions locally (Optional):**
   To test serverless streaming check functions locally, install Netlify CLI (`npm install -g netlify-cli`) and run:
   ```bash
   netlify dev
   ```

---

## 4) Usage and Workflows

### Standard User Flow
```
[Landing Page] ➔ [Register / Login] ➔ [Homepage Dashboard]
                                            │
   ┌────────────────────────────────────────┴────────────────────────────────────────┐
   ▼                                                                                 ▼
[Explore Genres & Search]                                                   [Select Airing Anime]
   │                                                                                 │
   ├───────────────────────────────➔ [Watch Episode] ⇦───────────────────────────────┤
   │                                     │                                           │
   ▼                                     ▼                                           ▼
[Add to Watchlist]             [Resume Playback Progress]                  [Real-Time Notifications]
```

### Configuration Options
The client is customizable using runtime configurations inside `src/context/data-provider.jsx`:
- `CACHE_TTL`: Standard caching window for basic operations (Default: 10 minutes).
- `FIVE_HOURS`: Cache window for persistent static data (like Anime Info) (Default: 5 hours).
- `ONE_DAY`: Cache window for rare-changing resources (Default: 24 hours).

---

## 5) Architecture and Design

OtakuStreams is split into a **Static Frontend Single Page App (SPA)** and a **Dynamic Microservice Backend API**.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT APPS & EDGE                              │
│                                                                              │
│   ┌───────────────┐     SessionStorage Caching     ┌────────────────────┐    │
│   │  React Client │ ◄────────────────────────────► │ DataProvider Cache │    │
│   └───────┬───────┘                                └────────────────────┘    │
│           │                                                                  │
│           │ Direct GraphQL/REST Queries                                      │
│           ├───➔ [AniList GraphQL Engine] (Trending, Search, Airing Schedules)│
│           ├───➔ [Jikan API Server] (MAL Metadata and detailed episode list) │
│           │                                                                  │
│           │ Stream Verification Calls                                        │
│           └───➔ [Netlify Serverless Check]                                   │
│                       │                                                      │
│                       └─➔ Megaplay Buzz Stream Check                         │
└───────────┼──────────────────────────────────────────────────────────────────┘
            │
            │ HTTP JWT API / Socket.IO Real-Time pipeline
            ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND SYSTEM                                 │
│                                                                              │
│   ┌───────────────┐      node-cron Trigger      ┌────────────────────────┐   │
│   │Express Server │ ◄────────────────────────── │ Airing Schedule Sync  │   │
│   └───────┬───────┘                             └────────────────────────┘   │
│           │                                                                  │
│           ├───➔ Socket.IO server ──➔ (Emits real-time live notification pop)│
│           │                                                                  │
│           ▼                                                                  │
│     [MongoDB DB]                                                             │
│     (Collections: Users, Watchlists, Continue Watching, Scheduled Episodes)  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 6) Development and Testing

### Available Commands
Inside the frontend directory, you can run:
* `npm run dev`: Boots Vite dev server on port `5173` with Hot Module Replacement.
* `npm run build`: Compiles application into highly-minified static files inside `dist/`.
* `npm run preview`: Launches a lightweight local static server to test the production build.
* `npm run lint`: Scrapes code styles and raises syntax issues using ESLint config rules.

### Branching Model and Contributions
- **`main`:** Stable production branch. Always deployable.
- **`develop`:** Integration branch for upcoming releases.
- **`feature/*`:** Sandbox branches created for individual components.
- **Pull Request Guidelines:** Ensure code lints perfectly (`npm run lint`), use semantic commit messages, and document any modifications made to environment parameters.

---

## 7) Deployment

The frontend project is pre-configured for automated continuous deployment on **Netlify**.

### Deployment Steps
1. Push your changes to your linked Git repository (GitHub/GitLab).
2. Connect the repository to Netlify.
3. Configure the build parameters in the Netlify UI:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Set the Environment Variables under Site Settings:
   - `VITE_API_BASE_URL` = (Your deployed backend API URL)
5. **Netlify Functions:** The Netlify engine will automatically recognize and host the serverless function inside `/netlify/functions/check-episode.js` on the edge.

---

## 8) CI/CD, Monitoring, and Security

### Security Practices
- **Strict HTTPS Proxying:** The serverless Netlify function acts as a secure reverse proxy, hiding request headers and keeping streaming APIs isolated from direct client exposure.
- **Token Isolation:** User authentication JWT tokens are stored securely and automatically parsed inside request headers using Axios interceptors.
- **Route Interception:** Protected pages (like watchlist management or profiles) block unauthenticated users, rerouting them to the landing portal.

---

## 9) Troubleshooting

### Common Frontend Anomalies & Fixes

1. **Vite Development Server Crashes on Startup:**
   - *Reason:* Node modules version mismatch.
   - *Remedy:* Clean cache and reinstall:
     ```bash
     rm -rf node_modules package-lock.json
     npm install
     ```

2. **Episodes List is Blank or Infinite Loading:**
   - *Reason:* AniList or Jikan API is rate limiting (HTTP 429).
   - *Remedy:* The codebase includes automatic retry backoffs. If the rate limits persist, clear your browser session storage (`sessionStorage.clear()`) to force a fresh connection.

3. **Megaplay or Stream Iframe returns "Oops! Something went wrong":**
   - *Reason:* Provider has not uploaded the episode or has deleted the endpoint.
   - *Remedy:* Tap **"Try Next Server"** inside the player UI to switch streams (e.g. from `HD-1` AniList or `HD-2` MAL to `HD-3` ZokoAnime, switching provider and ID routing).

---

## 10) Contributing and Contact

Contributions are highly valued! Join us in building the ultimate anime portal.

### Code of Conduct
Please review our community guidelines: maintain clean syntax, write reusable hooks, and stay respectful in pull request reviews.

### Maintainer Contact
- **Project Lead:** Jawahar Govindasamy
- **Repository:** [GitHub OtakuStreams](https://github.com/jawahargovindasamy/OtakuStreams)

---

## 11) License and Credits

### License
This project is licensed under the **MIT License** — feel free to use, modify, and distribute as desired.

### Credits
- Anime data powered by the [AniList API](https://anilist.gitbook.io/anilist-apiv2-docs/) and the [Jikan API](https://jikan.moe/).
- UI elements styled using [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/).
