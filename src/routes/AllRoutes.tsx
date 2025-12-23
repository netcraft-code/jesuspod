// import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";

import PrivateRoute from "./PrivateRoute";
import Home from "../pages/home/Home";
import RadioList from "../pages/Radio/RadioList";
import RadioPlayer from "../pages/Radio/RadioPlayer";
import AllRadio from "../pages/Radio/AllRadio";
import PodcastHome from "../pages/Podcast/PodcastHome";
import AllPodcast from "../pages/Podcast/AllPodcast";
import PodcastCategory from "../pages/Podcast/PodcastCategory";
import PodcastDetail from "../pages/Podcast/PodcastDetail";
import BooksHome from "../pages/Books/BooksHome";
import AllBooks from "../pages/Books/AllBooks";
import BooksCategory from "../pages/Books/BooksCategory";

export default function AllRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/radio" element={<RadioList />} />
      <Route path="/radio-player" element={<RadioPlayer />} />
      <Route path="/all-radio" element={<AllRadio />} />
      <Route path="/podcast" element={<PodcastHome />} />
      <Route path="/all-podcast" element={<AllPodcast />} />
      <Route path="/podcast-category" element={<PodcastCategory />} />

      <Route path="/podcastplayer/:id" element={<PodcastDetail />} />

      <Route path="/books" element={<BooksHome />} />
      <Route path="/all-books" element={<AllBooks />} />
      <Route path="/books-category" element={<BooksCategory />} />

      <Route
        path="/home/*"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<div style={{ padding: 40 }}>404 - Not Found</div>} />
    </Routes>
  );
}
