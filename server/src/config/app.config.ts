import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  upload: {
    driver: process.env.UPLOAD_DRIVER || 'local',
    localPath: process.env.UPLOAD_LOCAL_PATH || './uploads',
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    fromAddress: process.env.SMTP_FROM_ADDRESS,
    salesTeamEmail: process.env.SALES_TEAM_NOTIFICATION_EMAIL,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '600000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '500', 10),
  },
  seed: {
    superAdminEmail: process.env.SUPER_ADMIN_EMAIL || 'admin@talukder-upvc.com',
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456',
  },
}));
