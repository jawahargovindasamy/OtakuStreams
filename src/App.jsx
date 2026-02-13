import "./App.css";
import { Route, Router, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ContinueWatching from "./pages/ContinueWatching";
import Anime from "./pages/Anime";
import List from "./pages/List";
import AZ from "./pages/AZ";
import Genre from "./pages/Genre";
import Search from "./pages/Search";
import Producer from "./pages/Producer";
import Watch from "./pages/Watch";
import Watchlist from "./pages/Watchlist";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/subbed-anime" element={<List anime="subbed-anime" />} />
        <Route path="/dubbed-anime" element={<List anime="dubbed-anime" />} />
        <Route path="/most-popular" element={<List anime="most-popular" />} />
        <Route path="/top-airing" element={<List anime="top-airing" />} />
        <Route path="/most-favorite" element={<List anime="most-favorite" />} />
        <Route path="/completed" element={<List anime="completed" />} />
        <Route path="/movie" element={<List anime="movie" />} />
        <Route path="/tv" element={<List anime="tv" />} />
        <Route path="/ova" element={<List anime="ova" />} />
        <Route path="/ona" element={<List anime="ona" />} />
        <Route path="/special" element={<List anime="special" />} />
        <Route path="/top-upcoming" element={<List anime="top-upcoming" />} />
        <Route path="/recently-updated" element={<List anime="recently-updated" />} />
        <Route path="/watch/:episodeId" element={<Watch />} />
        <Route path="/genre/:name" element={<Genre />} />
        <Route path="/producer/:name" element={<Producer />} />
        <Route path="/az-list/:letter" element={<AZ />} />
        <Route path="/search" element={<Search />} />
        <Route path="/:id" element={<Anime />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/continue-watching" element={<ContinueWatching />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default App;
