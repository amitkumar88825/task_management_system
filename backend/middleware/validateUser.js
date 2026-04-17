

export const validateUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      message: "User only",
    });
  }
  next();
};

