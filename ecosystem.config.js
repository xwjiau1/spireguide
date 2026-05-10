module.exports = {
  apps: [
    {
      name: 'spireguide',
      script: 'index.js',
      cwd: '/root/.openclaw/workspace/tech/projects/slay-spire-guide/06-交付/build/dist',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_file: '/tmp/spireguide-pm2.log',
      error_file: '/tmp/spireguide-error.log',
      out_file: '/tmp/spireguide-out.log',
    },
  ],
};
