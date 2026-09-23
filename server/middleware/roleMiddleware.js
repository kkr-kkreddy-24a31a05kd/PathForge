// Enforces that the authenticated user possesses one of the allowed roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route.`
      });
    }

    next();
  };
};

// Enforces that a company account has been verified and approved by administrators
export const requireApprovedCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // Admins are exempt from company verification checks
  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role === 'company' && !req.user.isApproved) {
    return res.status(403).json({
      success: false,
      requiresApproval: true,
      message: 'Your company profile is currently pending administrator verification. You will be notified once approved to publish internships.'
    });
  }

  next();
};
