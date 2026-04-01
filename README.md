<div align="center">
  <img src="src/assets/Logo%20Light.png" alt="OtakuStreams Logo" width="200">
  <h1>🌸 OtakuStreams</h1>
  <p><strong>A modern, feature-rich anime streaming and discovery platform built with React and Vite.</strong></p>
  <p>
    <a href="#-about">About</a> •
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-folder-structure">Folder Structure</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-available-scripts">Scripts</a> •
    <a href="#-deployment">Deployment</a> •
    <a href="#-contributing">Contributing</a>
  </p>
  <p>
    <img alt="React" src="https://img.shields.io/badge/React-19-blue.svg" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-Fast-purple.svg" />
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-Utility--First-blueviolet.svg" />
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg" />
  </p>
</div>

---

## 📖 About

**OtakuStreams** is a sleek, responsive web application designed for anime enthusiasts. It provides a seamless viewing and discovery experience, allowing users to browse currently airing anime, search for their favorite shows, manage watchlists, and track their viewing progress. The project is built with a modern frontend stack, ensuring a fast and interactive user experience.

## ✨ Features

- 🔐 **Authentication:** Secure user registration and login system (`Login`, `Register`, `Forgot Password`).
- 🏠 **Dynamic Homepage:** Featuring a hero section, carousels for trending and popular anime.
- 🔍 **Advanced Search & Discovery:** Find anime by title, genre, or browse extensive A-Z and producer lists.
- 🎬 **Seamless Streaming:** A dedicated `Watch` page with a clean, modern video player interface and server selection.
-  watchlist **Personalized Lists:** Keep track of your favorite shows with a personal `Watchlist` and a `Continue Watching` list.
- 👤 **User Profiles:** Manage your profile, preferences, and view your activity.
- 🌓 **Theme Customization:** Switch between `Dark` and `Light` mode for comfortable viewing.
- 📅 **Episode Schedules:** Keep up with release schedules for ongoing anime.
- 📱 **Fully Responsive Design:** A great user experience on desktops, tablets, and mobile devices.
- 🔔 **Notifications:** Stay updated with important announcements and releases.

## 💻 Tech Stack

This project is built with a modern and powerful set of technologies:

- **Core:**
  - **[React 19](https://react.dev/):** For building user interfaces with components.
  - **[Vite](https://vitejs.dev/):** A next-generation frontend tooling for fast development and optimized builds.
  - **[React Router v6](https://reactrouter.com/):** For client-side routing and navigation.
- **Styling:**
  - **[Tailwind CSS](https://tailwindcss.com/):** A utility-first CSS framework for rapid UI development.
  - **[shadcn/ui](https://ui.shadcn.com/):** Beautifully designed, accessible, and customizable components.
  - **[Framer Motion](https://www.framer.com/motion/):** For creating smooth animations and transitions.
  - **[Lucide React](https://lucide.dev/):** A clean and consistent icon set.
- **State Management & Data:**
  - **React Context:** For managing global state like themes and authentication.
  - **[Axios](https://axios-http.com/):** For making HTTP requests to an external API.
- **Utilities:**
  - **[Day.js](https://day.js.org/):** A fast and lightweight date library.
  - **[clsx](https://github.com/lukeed/clsx):** A tiny utility for constructing `className` strings conditionally.

## 📂 Folder Structure

The project follows a component-based architecture, with a clear separation of concerns.

```
/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, icons, and other media
│   ├── components/      # Reusable UI components
│   │   └── ui/          # Components from shadcn/ui
│   ├── context/         # React context providers (Auth, Theme, Data)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Top-level page components for each route
│   ├── App.jsx          # Main application component with routing
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── .env                 # Environment variables (API keys, etc.)
├── package.json         # Project metadata and dependencies
└── vite.config.js       # Vite configuration
```

## 🚀 Getting Started

Follow these instructions to set up the project locally for development.

### Prerequisites

- **[Node.js](https://nodejs.org/)** (v18.0.0 or higher)
- **[npm](https://www.npmjs.com/)** (v9 or higher) or any other package manager like pnpm or yarn.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jawahargovindasamy/OtakuStreams.git
    cd OtakuStreams
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project. You will need to add the necessary API keys or other environment-specific variables.
    ```
    VITE_API_BASE_URL=https://your-api-endpoint.com
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## ⚙️ Available Scripts

-   `npm run dev`: Starts the Vite development server with hot module replacement.
-   `npm run build`: Bundles the application for production.
-   `npm run preview`: Serves the production build locally.
-   `npm run lint`: Lints the codebase using ESLint to check for errors and style issues.

## 🌐 Deployment

This application is configured for easy deployment on **[Netlify](https://www.netlify.com/)**. The `netlify.toml` file contains the necessary configuration to handle client-side routing correctly. Simply connect your Git repository to Netlify and configure it to use the `npm run build` command with a publish directory of `dist`.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please feel free to check the issues page.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

This project is licensed under the MIT License.
