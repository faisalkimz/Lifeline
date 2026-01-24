/**
 * Role-Based Access Control Utility
 */

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    COMPANY_ADMIN: 'company_admin',
    HR_MANAGER: 'hr_manager',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
};

export const PERMISSIONS = {
    VIEW_PAYROLL: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER],
    MANAGE_EMPLOYEES: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER],
    VIEW_ANALYTICS: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER],
    MANAGE_SETTINGS: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN],
    MANAGE_DEPARTMENTS: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER],
    APPROVE_LEAVE: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER, ROLES.MANAGER],
    VIEW_RECRUITMENT: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER, ROLES.MANAGER],
    VIEW_ASSETS_ADMIN: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER],
    VIEW_FORMS_ADMIN: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER],
    VIEW_DISCIPLINARY: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER],
};

/**
 * Check if a user role has a specific permission
 * @param {string} userRole 
 * @param {string[]} requiredRoles 
 * @returns {boolean}
 */
export const canAccess = (userRole, requiredRoles) => {
    if (!userRole) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(userRole);
};
