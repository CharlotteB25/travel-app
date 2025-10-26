import { Request } from "express";
import {
  ExtractJwt,
  Strategy as JWTStrategy,
  VerifiedCallback,
} from "passport-jwt";
import UserModel from "../../modules/User/User.model";

// read token from cookie named "token"
const cookieExtractor = (req: Request): string | null => {
  return req?.cookies?.token || null;
};

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    cookieExtractor, // ← 1st preference: cookie
    ExtractJwt.fromAuthHeaderAsBearerToken(), // ← fallback: Authorization
  ]),
  secretOrKey: process.env.JWT_SECRET || "defaultSecret",
};

const jwtStrategy = new JWTStrategy(
  jwtOptions,
  async (payload: any, done: VerifiedCallback) => {
    try {
      const user = await UserModel.findById(payload._id);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (e) {
      return done(e, false);
    }
  }
);

export default jwtStrategy;
