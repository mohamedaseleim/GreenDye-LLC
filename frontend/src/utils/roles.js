export const getUserRoles = user => [user?.role, ...(user?.roles || [])].filter(Boolean);
export const hasRole = (user, ...allowedRoles) => allowedRoles.some(role => getUserRoles(user).includes(role));
export const isAdministrator = user => hasRole(user, 'admin', 'super_admin');
