import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../redux/actions/authActions';
import HelmetHelper from '../Helmet/HelmetHelper';

function Login({ loginUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorReason, setErrorReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await loginUser(username, password);
      navigate('/');
    } catch (error) {
      setErrorReason('Invalid username or password');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="transition-colors bg-backColor image:bg-[unset] flex items-center justify-center h-screen min-h-screen">
      <HelmetHelper title="Log in - Playlist Shuffle" />
      <form
        className="w-11/12 md:w-1/3 mx-auto text-textColor"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold font-open mb-4 text-center">
          Log in
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
          className="w-full rounded-md px-4 py-2 font-open shadow-shadowBox active:shadow-none dark:shadow-shadowBoxDarkMode dark:active:shadow-none text-textColorInside hover:bg-secondary bg-primary active:scale-105"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
        <p className="text-center mt-4 font-open">
          Don&apos;t have an account?&nbsp;
          <Link className="text-secondary font-semibold underline" to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  loginUser,
};

export default connect(null, mapDispatchToProps)(Login);
