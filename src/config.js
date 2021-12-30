export const env = process.env.NODE_ENV
export const domain = env === 'production' ? 'api.minut.us' : window.location.hostname+':8800'
export const ssl = env === 'production'