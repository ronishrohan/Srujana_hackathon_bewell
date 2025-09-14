import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Sidebar from "./components/Sidebar/Sidebar";
import CreatePlan from "./pages/plans/CreatePlan";
import Plan from "./pages/plans/Plan";
import Sessions from "./pages/session/Sessions";
import Plans from "./pages/plans/Plans";
import Leaderboard from "./pages/leaderboard/Leaderboard";
import Assistant from "./components/Assistant/Assistant";
import Profile from "./pages/profile/Profile";
import StartSession from "./pages/session/StartSession";
import InSession from "./pages/session/InSession";

// import Nutri from "./pages/nutri/Nutri";
const App = () => {
  return (
    <div className="flex h-dvh font-geist">
      <Sidebar />
      <div className="overflow-auto w-full">
        <Assistant />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create" element={<CreatePlan />}></Route>
          <Route path="/start" element={<StartSession />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/session/:sessionId" element={<InSession />} />
          <Route path="/plan/:planId" element={<Plan />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile/:userId" element={<Profile />} />
          {/* <Route path="/nutri" element={<Nutri />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default App;
