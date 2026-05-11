import "./App.css";
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

/* ---- Lazy-loaded pages (each becomes its own split chunk) ---- */
const LandingPage      = lazy(() => import("./pages/LandingPage"));
const Home             = lazy(() => import("./pages/Home"));
const Profile          = lazy(() => import("./pages/Profile"));
const ContinueWatching = lazy(() => import("./pages/ContinueWatching"));
const Anime            = lazy(() => import("./pages/Anime"));
const List             = lazy(() => import("./pages/List"));
const AZ               = lazy(() => import("./pages/AZ"));
const Genre            = lazy(() => import("./pages/Genre"));
const Search           = lazy(() => import("./pages/Search"));
const Producer         = lazy(() => import("./pages/Producer"));
const Watch            = lazy(() => import("./pages/Watch"));
const Watchlist        = lazy(() => import("./pages/Watchlist"));
const Settings         = lazy(() => import("./pages/Settings"));
const Login            = lazy(() => import("./pages/Login"));
const Register         = lazy(() => import("./pages/Register"));
const ForgotPassword   = lazy(() => import("./pages/ForgotPassword"));
const Notification     = lazy(() => import("./pages/Notification"));

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/"                    element={<LandingPage />} />
        <Route path="/login"               element={<Login />} />
        <Route path="/register"            element={<Register />} />
        <Route path="/forgot-password"     element={<ForgotPassword />} />
        <Route path="/home"                element={<Home />} />
        <Route path="/most-popular"        element={<List anime="most-popular" />} />
        <Route path="/top-airing"          element={<List anime="top-airing" />} />
        <Route path="/most-favorite"       element={<List anime="most-favorite" />} />
        <Route path="/completed"           element={<List anime="completed" />} />
        <Route path="/movie"               element={<List anime="movie" />} />
        <Route path="/tv"                  element={<List anime="tv" />} />
        <Route path="/ova"                 element={<List anime="ova" />} />
        <Route path="/ona"                 element={<List anime="ona" />} />
        <Route path="/special"             element={<List anime="special" />} />
        <Route path="/top-upcoming"        element={<List anime="top-upcoming" />} />
        <Route path="/recently-updated"    element={<List anime="recently-updated" />} />
        <Route path="/watch/:id/:episodeNumber" element={<Watch />} />
        <Route path="/genre/:name"         element={<Genre />} />
        <Route path="/producer/:name"      element={<Producer />} />
        <Route path="/az-list/:letter"     element={<AZ />} />
        <Route path="/search"              element={<Search />} />
        <Route path="/:name/:id"           element={<Anime />} />
        <Route path="/profile"             element={<Profile />} />
        <Route path="/continue-watching"   element={<ContinueWatching />} />
        <Route path="/watchlist"           element={<Watchlist />} />
        <Route path="/settings"            element={<Settings />} />
        <Route path="/notification"        element={<Notification />} />
      </Routes>
    </Suspense>
  );
}

export default App;
