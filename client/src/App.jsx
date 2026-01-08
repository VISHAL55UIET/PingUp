import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import ChatBox from './pages/ChatBox';
import Connections from './pages/Connections';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import { useUser } from '@clerk/clerk-react';
import Layout from './pages/Layout';
import {Toaster} from 'react-hot-toast';

const App = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null; // prevents flicker

  return (
    <>
     <Toaster/> 
    <Routes>
      {/* PUBLIC ROUTE */}
      {!user && <Route path="/login" element={<Login />} />}

      {/* PROTECTED ROUTES */}
      {user ? (
        <Route path="/" element={<Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
    </>
  );
};

export default App;
