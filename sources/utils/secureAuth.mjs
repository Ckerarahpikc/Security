function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next()
  } else {
    return res.redirect('login', { errorMessage: 'Access denied. Try loggin in.'});
  }
}

export default isAuthenticated;