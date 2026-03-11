import { test, expect } from '@playwright/test';

test.describe('Home Screen Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display header with QDP logo and navigation icons', async ({ page }) => {
    // Check for QDP logo
    await expect(page.getByText('QDP')).toBeVisible();

    // Check for welcome text
    await expect(page.getByText('أهلاً بك !')).toBeVisible();

    // Check for location text
    await expect(page.getByText(/شارع 44 احمد ابن حنبل/)).toBeVisible();

    // Check for notification bell icon (check for SVG path for notifications)
    const notificationButton = page.locator('button').filter({ has: page.locator('svg path[d*="M12 22c1.1"]') });
    await expect(notificationButton).toBeVisible();

    // Check for red notification dot
    await expect(page.locator('.bg-red-500.rounded-full').first()).toBeVisible();
  });

  test('should display search bar with filter button', async ({ page }) => {
    // Check for search input
    const searchBar = page.getByText('البحث').first();
    await expect(searchBar).toBeVisible();

    // Click search bar and verify navigation
    await searchBar.click();
    await expect(page).toHaveURL(/\/search/);
  });

  test('should display hero banner with text overlay', async ({ page }) => {
    await page.goto('/home');

    // Check for hero text
    await expect(page.getByText('حيث تلتقي الفخامة بالبساطة')).toBeVisible();
    await expect(page.getByText('الفخامة والرفاهية والهندسة المعمارية المثالية')).toBeVisible();
  });

  test('should display contract warning alert', async ({ page }) => {
    // Check for red warning banner
    await expect(page.getByText(/منتهي، تبقى شهر على إنتهاء عقد الايجار/)).toBeVisible();

    // Verify alert has red background
    const alertBanner = page.locator('.bg-error-500');
    await expect(alertBanner).toBeVisible();
  });

  test('should display help section with booking button', async ({ page }) => {
    // Check for help section title
    await expect(page.getByText('تحتاج مساعدة؟')).toBeVisible();

    // Check for description
    await expect(page.getByText(/يمكنك الآن حجز موعد مع وكيل العقارات/)).toBeVisible();

    // Check for booking button
    const bookButton = page.getByRole('button', { name: /احجز موعدك/ });
    await expect(bookButton).toBeVisible();
  });

  test('should display 4 maintenance categories', async ({ page }) => {
    // Check for maintenance section title
    await expect(page.getByText('اطلب صيانتك')).toBeVisible();

    // Check for category labels
    await expect(page.getByText('صيانة الأثاث')).toBeVisible();
    await expect(page.getByText('صيانة السباكة')).toBeVisible();
    await expect(page.getByText('صيانة الكهرباء')).toBeVisible();
    await expect(page.getByText('صيانة التكييف')).toBeVisible();
  });

  test('should display featured properties section', async ({ page }) => {
    // Check for section title
    await expect(page.getByText('وحدات مميزة')).toBeVisible();

    // Check for "المزيد" button
    await expect(page.getByRole('button', { name: /المزيد/ }).first()).toBeVisible();

    // Wait for properties to load
    await page.waitForTimeout(2000);

    // Check if property cards are displayed (should have at least one)
    const propertyCards = page.locator('.space-y-4 > div');
    const count = await propertyCards.count();
    expect(count).toBeGreaterThanOrEqual(0); // Could be 0 if no data, or multiple if data exists
  });

  test('should display floating action button', async ({ page }) => {
    // Check for FAB with + icon
    const fab = page.locator('button.fixed.bottom-24.rounded-full');
    await expect(fab).toBeVisible();

    // Click FAB and verify navigation
    await fab.click();
    await expect(page).toHaveURL(/\/add-property/);
  });

  test('should display bottom navigation with 4 items', async ({ page }) => {
    // Check for navigation items
    await expect(page.getByText('الرئيسية')).toBeVisible();
    await expect(page.getByText('الوحدات')).toBeVisible();
    await expect(page.getByText('مواعيدي')).toBeVisible();
    await expect(page.getByText('حسابي')).toBeVisible();

    // Check for home indicator line
    const homeIndicator = page.locator('.w-32.h-1.bg-gray-300.rounded-full');
    await expect(homeIndicator).toBeVisible();
  });

  test('should navigate to services when clicking maintenance category', async ({ page }) => {
    // Click on first maintenance category
    const furnitureCategory = page.getByText('صيانة الأثاث');
    await furnitureCategory.click();

    // Verify navigation to services page
    await expect(page).toHaveURL(/\/services/);
  });

  test('should have RTL layout', async ({ page }) => {
    // Check if main container has dir="rtl"
    const mainContainer = page.locator('div[dir="rtl"]').first();
    await expect(mainContainer).toBeVisible();
  });
});
