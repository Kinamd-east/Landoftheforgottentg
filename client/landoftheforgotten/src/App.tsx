import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CoinApp from './CoinApp';
import Earn from './Earn';
import Boost from './Boost';
import Test from './test';
// import Invite from './Invite';
import telegramAnalytics from "@telegram-apps/analytics";
import LoadingPage from './LoadingPage';

const App = () => {
  useEffect(() => {
    telegramAnalytics.init({
      token: import.meta.env.VITE_TG_ANALYTICS, // SDK Auth token received via @DataChief_bot
      appName: "land", // The analytics identifier you entered in @DataChief_bot
    });
  }, []);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<CoinApp />} />
          <Route path="/boost" element={<Boost />} />
          {/* <Route path="/invites" element={<Invite />} /> */}
          {/* <Route path="/invites/invites?referrerId=${uid}" element={<CoinApp />} /> */}
          <Route path="/earn" element={<Earn />} />
          <Route path="/test" element={<Test />} />
          {/* landoftheforgotten */}
          <Route path='/load' element={<LoadingPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
