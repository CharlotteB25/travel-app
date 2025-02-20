import {
  ExtractJwt,
  Strategy as JWTStrategy,
  VerifiedCallback,
} from "passport-jwt";
import UserModel from "../../modules/User/User.model";

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "defaultSecret",
};

// JWT strategy to check token validity
const jwtStrategy = new JWTStrategy(
  jwtOptions,
  async (payload: any, done: VerifiedCallback) => {
    try {
      console.log("JWT Payload:", payload); // Debugging

      const user = await UserModel.findById(payload.id);
      if (!user) {
        console.log("JWT Auth: User not found");
        return done(null, false);
      }

      console.log("JWT Auth: User authenticated", user.email);
      return done(null, user);
    } catch (e) {
      console.error("JWT Strategy Error:", e);
      return done(e, false);
    }
  }
);

export default jwtStrategy;
