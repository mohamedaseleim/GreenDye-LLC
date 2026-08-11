const fs = require('fs');
const path = require('path');

describe('Administrative API route mounts', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const mounts = [
    '/api/admin/trainers',
    '/api/admin/certificates',
    '/api/admin/cms',
    '/api/admin/content-settings',
    '/api/admin/payments',
    '/api/admin/email-marketing',
    '/api/admin/security',
    '/api/admin/backup'
  ];

  test.each(mounts)('mounts %s', (mount) => {
    expect(server).toContain(mount);
  });
});
