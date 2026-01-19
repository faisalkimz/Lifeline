import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should show login page', async ({ page }) => {
        await page.goto('/login');
        await expect(page).toHaveTitle(/Lifeline/);
        await expect(page.locator('h1')).toContainText('Welcome back');
    });

    test('should allow user to type credentials', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@lifeline.com');
        await page.fill('input[name="password"]', 'password123');
        await expect(page.locator('input[name="email"]')).toHaveValue('admin@lifeline.com');
    });
});
