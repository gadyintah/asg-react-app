// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import SMSComponent from './components/SMSComponent';
import ChatComponent from './components/ChatComponent';
import EmailComponent from './components/EmailComponent';
import CallComponent from './components/CallComponent';
import './App.css';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar></Navbar>

        <Routes>
          <Route path="/" element={<h1>React Layout</h1>} />
          <Route path="/sms" element={<SMSComponent />} />
          <Route path="/chat" element={<ChatComponent />} />
          <Route path="/email" element={<EmailComponent />} />
           <Route path="/call" element={<CallComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
