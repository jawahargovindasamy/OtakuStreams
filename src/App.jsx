import "./App.css";
import { Route, Router, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ContinueWatching from "./pages/ContinueWatching";
import Anime from "./pages/Anime";
import List from "./pages/List";
import AZ from "./pages/AZ";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/subbed-anime" element={<List anime="subbed-anime" />} />
        <Route path="/dubbed-anime" element={<List anime="dubbed-anime" />} />
        <Route path="/most-popular" element={<List anime="most-popular" />} />
        <Route path="/movie" element={<List anime="movie" />} />
        <Route path="/tv" element={<List anime="tv" />} />
        <Route path="/ova" element={<List anime="ova" />} />
        <Route path="/ona" element={<List anime="ona" />} />
        <Route path="/special" element={<List anime="special" />} />
        <Route path="/az-list" element={<AZ />} />
        <Route path="/az-list/:letter" element={<AZ />} />
        <Route path="/:id" element={<Anime />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/continue-watching" element={<ContinueWatching />} />
      </Routes>
    </>
  );
}

export default App;
