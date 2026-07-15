import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

function RequireAuth({ auth, children }) {
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
}

RequireAuth.propTypes = {
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(RequireAuth);
