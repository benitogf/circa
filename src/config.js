export const env = process.env.NODE_ENV
export const domain = env === 'production' ? 'api.minut.us' : 'localhost:8800'
export const ssl = env === 'production'