import React, { useState } from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import Header from './Header';

const Login = () => {
  const [username, setUsername] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    if (username.trim() !== '') {
      localStorage.setItem('username', username);
    } else {
      alert('Please enter a username!');
      return;
    }
  };

  return (
    <main>
    <Header/>
      <div className='form-container'>
        <form onSubmit={handleLogin} className='login-form'>
          <input
            type='text'
            placeholder='Enter your username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Link to={username.trim() !== '' ? `/chat/${username}` : '/'} >
            <button className='login-link'>LOGIN</button>
          </Link>
        </form>
      </div>
      </main>
  );
}

export default Login;
