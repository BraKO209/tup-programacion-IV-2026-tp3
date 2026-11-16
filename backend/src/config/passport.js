import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'super_secreto_utn_prog4_2026_jwt_key'
};

passport.use(
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, nombre, email, created_at FROM usuarios WHERE id = ?',
        [jwtPayload.id]
      );

      if (rows.length > 0) {
        return done(null, rows[0]);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
