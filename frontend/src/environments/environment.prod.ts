export const environment = {
  production: true,
  apiUrl: '/api',
  wsUrl: `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`,
  appName: 'WebSocket Payment Service',
  version: '1.0.0'
};