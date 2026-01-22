// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/theme-provider.jsx";
import { BrowserRouter } from "react-router-dom";
import { DataProvider } from "./context/data-provider";
import { AuthProvider } from "./context/auth-provider";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <ThemeProvider>
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  </ThemeProvider>,

  // </StrictMode>,
);
