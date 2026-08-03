import React from 'react';
import { connect } from 'react-redux';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

function AboutPage() {
  const deleteLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };
  return (
    <div className="transition-colors bg-backColor image:bg-[unset] flex flex-col justify-between h-[100vh]">
      <Navbar />
      <div className="flex items-center justify-center overflow-y-auto">
        <div className="text-base text-justify text-textColor w-4/4 md:w-3/5">
          <p className="mx-4 my-2 font-open">
            To clean the localStorage data click&nbsp;
            <button
              type="button"
              className="text-primary"
              onClick={deleteLocalStorage}
            >
              here
            </button>
          </p>
          <p className="mx-4 my-2 font-open">
            This project is a fork of&nbsp;
            <a
              aria-label="original playlistShuffle repository"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
              href="https://github.com/jooonathann/playlistShuffle"
            >
              jooonathann/playlistShuffle
            </a>
            , originally created because the shuffle algorithm on YouTube
            doesn&apos;t effectively shuffle, and other pages didn&apos;t have
            the features being looked for.
          </p>
          <p className="mx-4 my-2 font-open">
            This fork adds account login with cloud-synced playlists (so your
            saved playlists follow you across devices/browsers instead of
            living only in this browser&apos;s localStorage) and a data saver
            mode to reduce bandwidth usage.
          </p>
          <p className="mx-4 my-2 font-open">
            Playlist data you save is stored in a database tied to your
            account. Song metadata (titles, channel names) is still cached in
            this browser&apos;s localStorage for faster loading, and can fit
            at least 20000 videos in playlist on chrome desktop; if
            you have an error while loading a playlist you will have to
            delete it and load it again.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default connect(null, null)(AboutPage);
