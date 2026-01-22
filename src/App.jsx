import "./App.css";
import { Route, Router, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ContinueWatching from "./pages/ContinueWatching";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/continue-watching" element={<ContinueWatching/>}/>
      </Routes>
    </>
  );
}

export default App;
