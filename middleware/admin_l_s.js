const checkSession = (req, res, next) => {
  if (req.session.admin) {
    return res.redirect("/admin/adminDashBoard"); // Adjust the path as needed
  } else {
    next();
  }
};

module.exports = checkSession;
