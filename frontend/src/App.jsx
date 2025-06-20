import Navbar from './components/Navbar'

import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

import { Routes, Route, Navigate  } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore'; //exprt from useThemeStore.jsx

import { useEffect } from 'react';

import {Loader} from "lucide-react";
import { Toaster } from 'react-hot-toast';

const App = () => {   //Uses the store to check if user is logged in
  const {authUser, checkAuth, isCheckingAuth, onlineUsers} = useAuthStore(); //If the user is logged in, authUser gets updated
   const { theme } = useThemeStore();

   console.log({ onlineUsers });

  //authUser conatin current user
//useEffect() triggers → calls checkAuth(),  checkAuth() sends a request to backend /auth/check
//checkAuth() sends a request to backend /auth/check,  App now knows who is logged in → can show Navbar, Profile, etc.
  useEffect(() =>{  //It runs code after the component loads or when something changes.
    checkAuth()   //checkAuth() (the function to check if the user is logged in)
  },[checkAuth]);

  console.log({ authUser });

if(isCheckingAuth && !authUser) return (
  <div className='flex items-center justify-center h-screen'>
        <Loader className="size-10 animate-spin"/>
  </div>
)

  return (
    
    <div data-theme={theme}>
      <Navbar/>

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster/>

    </div>
  );
};

export default App
