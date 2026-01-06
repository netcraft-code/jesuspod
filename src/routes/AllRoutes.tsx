// import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";

import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Home from "../pages/home/Home";
import RadioList from "../pages/Radio/RadioList";
import RadioPlayer from "../pages/Radio/RadioPlayer";
import AllRadio from "../pages/Radio/AllRadio";
import FavoriteRadios from "../pages/Radio/FavoriteRadios";
import PodcastHome from "../pages/Podcast/PodcastHome";
import AllPodcast from "../pages/Podcast/AllPodcast";
import AllChannels from "../pages/Channels/AllChannels.tsx";
import ChannelListing from "../pages/Channels/ChannelListing.tsx";
import PodcastCategory from "../pages/Podcast/PodcastCategory";
import PodcastDetail from "../pages/Podcast/PodcastDetail";
import BooksHome from "../pages/Books/BooksHome";
import AllBooks from "../pages/Books/AllBooks";
import BooksCategory from "../pages/Books/BooksCategory";
import Shorts from "../pages/Shorts/Shorts";
import SavedShorts from "../pages/SavedShorts/SavedShorts";
import Subscriptions from "../pages/Profile/Subscriptions";
import Downloads from "../pages/Profile/Downloads";
import LiveList from "../pages/Live/LiveList";
import LivePlayer from "../pages/Live/LivePlayer";

// Component to handle base URL redirect
function BaseRedirect() {
  const token = localStorage.getItem("token");
  return <Navigate to={token ? "/home" : "/login"} replace />;
}

export default function AllRoutes() {
  return (
    <Routes>
      {/* Base URL - redirect based on login status */}
      <Route path="/" element={<BaseRedirect />} />

      {/* Public Routes - Auth pages */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/forgot" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Protected Routes - App pages */}
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />

      {/* Radio Routes */}
      <Route path="/radio" element={<PrivateRoute><RadioList /></PrivateRoute>} />
      <Route path="/radio-player" element={<PrivateRoute><RadioPlayer /></PrivateRoute>} />
      <Route path="/all-radio" element={<PrivateRoute><AllRadio /></PrivateRoute>} />
      <Route path="/favorite-radios" element={<PrivateRoute><FavoriteRadios /></PrivateRoute>} />

      {/* Podcast Routes */}
      <Route path="/podcast" element={<PrivateRoute><PodcastHome /></PrivateRoute>} />
      <Route path="/all-podcast" element={<PrivateRoute><AllPodcast /></PrivateRoute>} />
      <Route path="/podcast-category" element={<PrivateRoute><PodcastCategory /></PrivateRoute>} />
      <Route path="/podcastplayer/:id" element={<PrivateRoute><PodcastDetail /></PrivateRoute>} />

      {/* Channels Route */}
      <Route path="/channel-listing" element={<PrivateRoute><ChannelListing /></PrivateRoute>} />
      <Route path="/all-channels" element={<PrivateRoute><AllChannels /></PrivateRoute>} />

      {/* Shorts */}
      <Route path="/shorts" element={<PrivateRoute><Shorts /></PrivateRoute>} />
      <Route path="/saved-shorts" element={<PrivateRoute><SavedShorts /></PrivateRoute>} />

      {/* Books Routes */}
      <Route path="/books" element={<PrivateRoute><BooksHome /></PrivateRoute>} />
      <Route path="/all-books" element={<PrivateRoute><AllBooks /></PrivateRoute>} />
      <Route path="/books-category" element={<PrivateRoute><BooksCategory /></PrivateRoute>} />

      {/* Profile Routes */}
      <Route path="/subscriptions" element={<PrivateRoute><Subscriptions /></PrivateRoute>} />
      <Route path="/downloads" element={<PrivateRoute><Downloads /></PrivateRoute>} />

      {/* Live Routes */}
      <Route path="/live-list" element={<PrivateRoute><LiveList /></PrivateRoute>} />
      <Route path="/live-player" element={<PrivateRoute><LivePlayer /></PrivateRoute>} />

      {/* 404 Route */}
      <Route path="*" element={<div style={{ padding: 40 }}>404 - Not Found</div>} />
    </Routes>
  );
}
