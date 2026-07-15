import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../redux/actions/authActions';
import HelmetHelper from '../Helmet/HelmetHelper';

function Register({ registerUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorReason, setErrorReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerUser(username, password);
      navigate('/');
    } catch (error) {
      setErrorReason('Username already taken');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="transition-colors bg-backColor image:bg-[unset] flex items-center justify-center h-screen min-h-screen">
      <HelmetHelper title="Register - Playlist Shuffle" />
      <form
        className="w-11/12 md:w-1/3 mx-auto text-textColorInside bg-primary rounded-lg shadow-shadowBox dark:shadow-shadowBoxDarkMode p-6"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold font-open mb-4 text-center">
          Register
        </h1>
        {errorReason ? (
          <p className="text-red text-center mb-2 font-open">{errorReason}</p>
        ) : null}
        <input
          className="inputSearch w-full mb-2 py-2 px-2 rounded-md font-open shadow-lg focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="inputSearch w-full mb-4 py-2 px-2 rounded-md font-open shadow-lg focus:outline-none focus:shadow-outline"
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full rounded-md px-4 py-2 font-open shadow-shadowBox active:shadow-none dark:shadow-shadowBoxDarkMode dark:active:shadow-none text-textColorInside hover:bg-secondary bg-backColor/20 active:scale-105"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering…' : 'Register'}
        </button>
        <p className="text-center mt-4 font-open">
          Already have an account?&nbsp;
          <Link className="font-semibold underline" to="/login">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  registerUser,
};

export default connect(null, mapDispatchToProps)(Register);
