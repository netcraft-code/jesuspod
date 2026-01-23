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
import MoviesList from "../pages/Movies/MoviesList";
import AllMovies from "../pages/Movies/AllMovies";
import PrivacyPolicy from "../pages/PrivacyPolicy/PrivacyPolicy";
import HelpCenter from "../pages/HelpCenter/HelpCenter";

// Component to handle base URL redirect
function BaseRedirect() {
  // const token = localStorage.getItem("token");
  // Always redirect to home, whether logged in or not
  return <Navigate to="/home" replace />;
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
      {/* Now Publicly Accessible */}
      <Route path="/home" element={<Home />} />

      {/* Radio Routes */}
      <Route path="/radio" element={<RadioList />} />
      <Route path="/radio-player" element={<RadioPlayer />} />
      <Route path="/all-radio" element={<AllRadio />} />
      <Route path="/favorite-radios" element={<PrivateRoute><FavoriteRadios /></PrivateRoute>} />

      {/* Podcast Routes */}
      <Route path="/podcast" element={<PodcastHome />} />
      <Route path="/all-podcast" element={<AllPodcast />} />
      <Route path="/podcast-category" element={<PodcastCategory />} />
      <Route path="/podcastplayer/:id" element={<PodcastDetail />} />

      {/* Channels Route */}
      <Route path="/channel-listing" element={<ChannelListing />} />
      <Route path="/all-channels" element={<AllChannels />} />

      {/* Shorts */}
      <Route path="/shorts" element={<Shorts />} />
      <Route path="/saved-shorts" element={<PrivateRoute><SavedShorts /></PrivateRoute>} />

      {/* Books Routes */}
      <Route path="/books" element={<BooksHome />} />
      <Route path="/all-books" element={<AllBooks />} />
      <Route path="/books-category" element={<BooksCategory />} />

      {/* Profile Routes - KEEP PRIVATE */}
      <Route path="/subscriptions" element={<PrivateRoute><Subscriptions /></PrivateRoute>} />
      <Route path="/downloads" element={<PrivateRoute><Downloads /></PrivateRoute>} />

      {/* Live Routes */}
      <Route path="/live-list" element={<LiveList />} />
      <Route path="/live-player" element={<LivePlayer />} />

      {/* Movies Routes */}
      <Route path="/movies" element={<MoviesList />} />
      <Route path="/all-movies" element={<AllMovies />} />

      {/* Profile Menu Routes - Maybe public? Let's make them public */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/help-center" element={<HelpCenter />} />

      {/* 404 Route */}
      <Route path="*" element={<div style={{ padding: 40 }}>404 - Not Found</div>} />
    </Routes>
  );
}
