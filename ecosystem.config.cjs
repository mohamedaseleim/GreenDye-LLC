module.exports = {
  apps: [{
    name: 'greendye-api',
    cwd: './backend',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '750M',
    kill_timeout: 30000,
    listen_timeout: 15000,
    wait_ready: false,
    merge_logs: true,
    time: true,
    env_production: { NODE_ENV: 'production' }
  }]
};
