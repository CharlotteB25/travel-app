import passport from "passport";
import AuthError from "../error/AuthError";
import { User } from "../../modules/User/User.types";
import { NextFunction, Request, Response } from "express";
import localStrategy from "./localStrategy";
import jwtStrategy from "./jwtStrategy";

// Setup passport strategies
passport.use("local", localStrategy);
passport.use("jwt", jwtStrategy);

export interface AuthRequest extends Request {
  user: User;
}

// Helper to apply passport strategy
const passportHandler = (strategy: string) => {
  return function (req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      strategy,
      { session: false },
      function (err: any, user?: User | false) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(new AuthError()); // Handle auth errors
        } else {
          req.user = user; // Attach user to request
          return next();
        }
      }
    )(req, res, next);
  };
};

// Export JWT-based auth middleware
const authJwt = passportHandler("jwt");

// Export both authLocal and authJwt if you need other strategies (like local)
export { authJwt };
