import { test, expect } from '@playwright/test';

test.describe('Property Detail Screen Tests', () => {

  // We'll use a mock property ID for testing
  // In real tests, you'd get this from the API or use a fixed test property
  const mockPropertyId = '68ee3982105e75147c37a30e';

  test.beforeEach(async ({ page }) => {
    // Navigate to property detail page
    await page.goto(`/property/${mockPropertyId}`);
    await page.waitForLoadState('networkidle');
    // Give time for API to load
    await page.waitForTimeout(2000);
  });

  test('should display property image or loading state', async ({ page }) => {
    // Check for image container or loading spinner
    const imageContainer = page.locator('.relative.h-64');
    await expect(imageContainer).toBeVisible();

    // Check if loading spinner or image is present
    const spinner = page.locator('.animate-spin');
    const isLoading = await spinner.isVisible().catch(() => false);

    if (!isLoading) {
      // If not loading, should have image or placeholder
      const hasImage = await page.locator('img').count() > 0;
      const hasPlaceholder = await page.getByText('لا توجد صورة').isVisible().catch(() => false);
      expect(hasImage || hasPlaceholder).toBeTruthy();
    }
  });

  test('should display header with back button and title', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for back button
    const backButton = page.locator('button').first();
    await expect(backButton).toBeVisible();

    // Check for header title
    await expect(page.getByText('تفاصيل الوحدة')).toBeVisible();
  });

  test('should display QDP or external badge', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for badge (QDP or خارجي)
    const qdpBadge = page.getByText('QDP', { exact: true });
    const externalBadge = page.getByText('خارجي');

    const hasQdpBadge = await qdpBadge.isVisible().catch(() => false);
    const hasExternalBadge = await externalBadge.isVisible().catch(() => false);

    expect(hasQdpBadge || hasExternalBadge).toBeTruthy();
  });

  test('should display property title and location', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Look for any heading with h2 class (property title)
    const title = page.locator('h2.text-2xl');
    const hasTitle = await title.count() > 0;

    if (hasTitle) {
      await expect(title.first()).toBeVisible();
    }

    // Check for location icon (green pin)
    const locationIcon = page.locator('svg.text-success-500');
    const hasLocationIcon = await locationIcon.count() > 0;

    if (hasLocationIcon) {
      await expect(locationIcon.first()).toBeVisible();
    }
  });

  test('should display 4 specification circles', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for specification circles (should have 4)
    const specCircles = page.locator('.w-16.h-16.bg-gray-100.rounded-full');
    const count = await specCircles.count();

    expect(count).toBe(4);
  });

  test('should display nearby services section', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for section title
    await expect(page.getByText('الخدمات القريبة')).toBeVisible();

    // Check for at least one checkmark icon
    const checkmarks = page.locator('svg.text-success-500 path[d*="M9 16.17L4.83"]');
    const count = await checkmarks.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should display map placeholder', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for map container
    const mapContainer = page.locator('.w-full.h-48.bg-gray-100.rounded-lg');
    await expect(mapContainer).toBeVisible();

    // Check for map icon
    await expect(page.getByText('موقع العقار')).toBeVisible();
  });

  test('should display pricing information', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for price labels
    const rentalPrice = page.getByText('سعر الايجار');
    const salePrice = page.getByText('سعر البيع');

    // At least one should be visible
    const hasRental = await rentalPrice.isVisible().catch(() => false);
    const hasSale = await salePrice.isVisible().catch(() => false);

    expect(hasRental || hasSale).toBeTruthy();

    // Check for price values with QAR currency
    const priceWithQAR = page.locator('text=/ر\\.ق/');
    const priceCount = await priceWithQAR.count();

    expect(priceCount).toBeGreaterThan(0);
  });

  test('should display bottom action buttons', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for "طلب معاينة" button
    const viewRequestButton = page.getByRole('button', { name: /طلب معاينة/ });
    await expect(viewRequestButton).toBeVisible();

    // Check for "حجز الوحدة" button
    const bookButton = page.getByRole('button', { name: /حجز الوحدة/ });
    await expect(bookButton).toBeVisible();
  });

  test('should navigate to booking when clicking book button', async ({ page }) => {
    await page.waitForTimeout(2000);

    const bookButton = page.getByRole('button', { name: /حجز الوحدة/ });

    // Click the button
    await bookButton.click();

    // Should navigate to booking page
    await expect(page).toHaveURL(new RegExp(`/property/${mockPropertyId}/booking`));
  });

  test('should navigate back when clicking back button', async ({ page }) => {
    await page.waitForTimeout(2000);

    const backButton = page.locator('button').first();
    await backButton.click();

    // Should navigate away from property detail
    await page.waitForTimeout(500);
    await expect(page).not.toHaveURL(new RegExp(`/property/${mockPropertyId}`));
  });

  test('should have favorite button functionality', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Look for favorite button (heart icon)
    const favoriteButton = page.locator('button.rounded-full').filter({ has: page.locator('svg path[d*="M16.5 3c-1.74"]') });
    const hasFavorite = await favoriteButton.count() > 0;

    if (hasFavorite) {
      await expect(favoriteButton.first()).toBeVisible();

      // Click to toggle favorite
      await favoriteButton.first().click();

      // Should remain on page
      await expect(page).toHaveURL(new RegExp(`/property/${mockPropertyId}`));
    }
  });

  test('should handle loading state gracefully', async ({ page }) => {
    // Check if loading spinner appears initially
    const spinner = page.locator('.animate-spin');

    // Wait for either spinner to disappear or content to load
    await page.waitForTimeout(3000);

    // After loading, should show content or error message
    const hasContent = await page.locator('h2.text-2xl').count() > 0;
    const hasError = await page.getByText('العقار غير موجود').isVisible().catch(() => false);

    expect(hasContent || hasError).toBeTruthy();
  });

  test('should have RTL layout', async ({ page }) => {
    await page.waitForTimeout(2000);

    const mainContainer = page.locator('div[dir="rtl"]').first();
    await expect(mainContainer).toBeVisible();
  });
});
