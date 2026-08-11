const fs = require('fs');
const path = require('path');

describe('Admin trainer route wiring', () => {
  test('server mounts the admin trainer router', () => {
    const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
    expect(server).toContain("/api/admin/trainers");
    expect(server).toContain("./routes/adminTrainerRoutes");
  });

  test('pending applications route precedes the dynamic id route', () => {
    const routes = fs.readFileSync(path.join(__dirname, '..', 'routes', 'adminTrainerRoutes.js'), 'utf8');
    expect(routes.indexOf("/applications/pending")).toBeGreaterThan(-1);
    expect(routes.indexOf("/applications/pending")).toBeLessThan(routes.indexOf("router.route('/:id')"));
    expect(routes).toContain("authorize('admin', 'super_admin')");
  });
});
