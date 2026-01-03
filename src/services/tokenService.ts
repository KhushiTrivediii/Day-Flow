import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/config';
import { JWTPayload, AuthResponse, UserProfile } from '../types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class TokenService {
  /**
   * Generate JWT access and refresh tokens for a user
   */
  static generateTokens(user: UserProfile): TokenPair {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      loginId: user.loginId,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as SignOptions);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify and decode JWT access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Verify and decode JWT refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Generate new access token using refresh token
   */
  static refreshAccessToken(refreshToken: string): string {
    const decoded = this.verifyRefreshToken(refreshToken);

    const payload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      loginId: decoded.loginId,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as SignOptions);
  }

  /**
   * Create complete auth response with tokens and user info
   */
  static createAuthResponse(user: UserProfile): AuthResponse {
    const tokens = this.generateTokens(user);

    // Parse expiration time from config (e.g., "15m" -> 15 * 60 = 900 seconds)
    const expiresIn = this.parseExpirationTime(config.jwt.expiresIn);

    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      expiresIn,
    };
  }

  /**
   * Parse expiration time string to seconds
   */
  private static parseExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // Default 15 minutes
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 900;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Check if token is expired (without throwing)
   */
  static isTokenExpired(token: string): boolean {
    try {
      jwt.verify(token, config.jwt.secret);
      return false;
    } catch (error) {
      return error instanceof jwt.TokenExpiredError;
    }
  }
}
