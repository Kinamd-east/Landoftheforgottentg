import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CoinApp from './CoinApp';
import Earn from './Earn';
import Boost from './Boost';
import Test from './test';
import Invite from './Invite';
import LoadingPage from './LoadingPage';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<CoinApp />} />
          <Route path="/boost" element={<Boost />} />
          <Route path="/invites" element={<Invite />} />
          {/* <Route path="/invites/invites?referrerId=${uid}" element={<CoinApp />} /> */}
          <Route path="/earn" element={<Earn />} />
          <Route path="/test" element={<Test />} />
          <Route path='/load' element={<LoadingPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
