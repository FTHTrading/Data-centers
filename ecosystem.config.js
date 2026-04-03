module.exports = {
  apps: [{
    name: 'dc-os',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3003',
    cwd: 'C:\\Users\\Kevan\\unykorn-dc-os',
    env: {
      NODE_ENV: 'production',
      PORT: '3003'
    }
  }]
}
