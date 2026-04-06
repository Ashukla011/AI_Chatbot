import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? `${import.meta.env.BASE_URL}/api/user/login` : `${import.meta.env.BASE_URL}/api/user/register`;
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.token) {
        login(data);
      } else {
        alert(data.message || 'Error occurred');
      }
    } catch (err) {
      alert('Failed to connect to server');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn">
          {isLogin ? 'Sign In' : 'Register'}
        </button>
      </form>
      <div className="toggle-link">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Register' : 'Sign In'}
        </span>
      </div>
    </div>
  );
};

export default AuthForm;
