import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Route, Routes } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { Analytics } from '@vercel/analytics/react';
import HomePage from './components/HomePage/HomePage';
import PlaylistPage from './components/PlaylistPage/PlaylistPage';
import './app.css';
import ErrorPage from './components/ErrorPage/ErrorPage';
import AboutPage from './components/AboutPage/AboutPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import RequireAuth from './components/Auth/RequireAuth';
import { setWordsToSearch } from './redux/actions/playerActions';
import { restoreSession } from './redux/actions/authActions';
import { loadPlaylistsFromServer } from './redux/actions/playlistDetailsActions';

function App({
  player,
  auth,
  setWordsToSearch,
  restoreSession,
  loadPlaylistsFromServer,
}) {
  useEffect(() => {
    setWordsToSearch('');
    restoreSession();
    // Applies the `light`/`dark`/`image` class tw-colors' theme plugin relies on to every
    // page — this used to only run inside Navbar, so pages without a Navbar (e.g. Login,
    // Register) never got a theme class and every themed color utility silently no-opped.
    if (player.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('image');
      document.documentElement.classList.add('light');
    }
    if (player.theme === 'dark') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.remove('image');
      document.documentElement.classList.add('dark');
    }
    if (player.theme === 'image') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('image');
    }
  }, []);
  useEffect(() => {
    if (auth.isAuthenticated) {
      loadPlaylistsFromServer();
    }
  }, [auth.isAuthenticated]);
  const ref = useRef(null);
  const coverImage = `https://i.ytimg.com/vi/${player.currentSong}/hqdefault.jpg`;
  useEffect(() => {
    if (player.theme === 'image') {
      ref.current.style.transition = 'background 700ms ease-in-out 150ms';
      ref.current.style.backgroundBlendMode = 'multiply';
      ref.current.style.backgroundSize = 'cover';
      ref.current.style.backgroundPosition = 'center';
      ref.current.style.backgroundColor = '#404040';
      if (player.currentSong === '') {
        ref.current.style.backgroundImage =
          'url(./assets/images/silivan-munguarakarama-NrR9gn3lFKU-unsplash.jpg)';
      } else {
        ref.current.style.backgroundImage = `url(${coverImage})`;
      }
    }
  }, [player.currentSong, player.theme]);

  return (
    <div ref={ref} id="app">
      <div className="backdrop-blur-sm">
        <Routes>
          <Route
            exact
            path="/"
            element={(
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            )}
          />
          <Route
            exact
            path="/:id"
            element={(
              <RequireAuth>
                <PlaylistPage />
              </RequireAuth>
            )}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <Analytics />
      </div>
    </div>
  );
}
App.propTypes = {
  player: PropTypes.shape({
    currentSong: PropTypes.string.isRequired,
    theme: PropTypes.string.isRequired,
    searchWords: PropTypes.string.isRequired,
  }).isRequired,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool.isRequired,
  }).isRequired,
  setWordsToSearch: PropTypes.func.isRequired,
  restoreSession: PropTypes.func.isRequired,
  loadPlaylistsFromServer: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  player: state.player,
  playlistSongsById: state.playlistSongsById,
  playlistDetails: state.playlistDetails,
  auth: state.auth,
});

const mapDispatchToProps = {
  setWordsToSearch,
  restoreSession,
  loadPlaylistsFromServer,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);

