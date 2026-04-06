import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import AuthForm from './components/Auth/AuthForm';
import ChatBox from './components/Chat/ChatBox';

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <div className="app-container">
      {!user ? <AuthForm /> : <ChatBox />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
