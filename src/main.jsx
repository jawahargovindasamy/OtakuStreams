// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/theme-provider.jsx";
import { BrowserRouter } from "react-router-dom";
import { DataProvider } from "./context/data-provider";
import { AuthProvider } from "./context/auth-provider";
import ScrollToTop from "./components/ScrollToTop";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <ScrollToTop />
          <App />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>


  // </StrictMode>,
);
