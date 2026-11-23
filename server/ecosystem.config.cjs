module.exports = {
  apps: [
    {
      name: 'spendwell-api',
      script: 'src/index.js',
      cwd: '/var/www/expense/server',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
