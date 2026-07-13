import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Check if authorization header is provided
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // If token is literally 'guest_mode_token', bypass verification and assign guest user
      if (token === 'guest_mode_token') {
        // If MongoDB is disconnected, use in-memory mock user immediately
        if (mongoose.connection.readyState !== 1) {
          req.user = { id: '60c72b2f9b1d8b2bad888888', _id: '60c72b2f9b1d8b2bad888888', email: 'guest@example.com' };
          return next();
        }

        let guestUser = await User.findOne({ email: 'guest@example.com' });
        if (!guestUser) {
          guestUser = await User.create({
            email: 'guest@example.com',
            password: 'guestpassword123'
          });
        }
        req.user = guestUser;
        return next();
      }

      // If MongoDB is disconnected, fallback for normal token verification as well
      if (mongoose.connection.readyState !== 1) {
        req.user = { id: '60c72b2f9b1d8b2bad888888', _id: '60c72b2f9b1d8b2bad888888', email: 'guest@example.com' };
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_resume_key_12345');
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found, authorization denied' });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // If NO token header is provided, automatically log in the guest user
    try {
      if (mongoose.connection.readyState !== 1) {
        req.user = { id: '60c72b2f9b1d8b2bad888888', _id: '60c72b2f9b1d8b2bad888888', email: 'guest@example.com' };
        return next();
      }

      let guestUser = await User.findOne({ email: 'guest@example.com' });
      if (!guestUser) {
        guestUser = await User.create({
          email: 'guest@example.com',
          password: 'guestpassword123'
        });
      }
      req.user = guestUser;
      next();
    } catch (error) {
      console.error('Guest auto-login error:', error);
      res.status(500).json({ message: 'Failed to authenticate guest session' });
    }
  }
};
