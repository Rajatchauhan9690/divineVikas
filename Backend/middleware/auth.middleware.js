import jwt from "jsonwebtoken";

export const protectAdmin = (req, res, next) => {
  try {
    const token =
      req.cookies?.adminToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized as admin" });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};
