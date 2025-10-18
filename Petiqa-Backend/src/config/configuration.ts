export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  globalPrefix: process.env.GLOBAL_PREFIX || 'petiqa',
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/petiqa',
  },
  swagger: {
    enabled: (process.env.ENABLE_SWAGGER || 'false').toLowerCase() === 'true',
    username: process.env.SWAGGER_USER || 'admin',
    password: process.env.SWAGGER_PASSWORD || 'admin',
  },
});
