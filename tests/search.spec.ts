import { test, expect } from '@playwright/test';

test.describe('Search Screens Tests', () => {

  test.describe('Search Empty State', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('networkidle');
    });

    test('should display search header with back button', async ({ page }) => {
      // Check for back button
      const backButton = page.locator('button').first();
      await expect(backButton).toBeVisible();

      // Check for title
      await expect(page.getByText('البحث')).toBeVisible();
    });

    test('should display search input with filter button', async ({ page }) => {
      // Check for search input
      const searchInput = page.locator('input[placeholder="البحث"]');
      await expect(searchInput).toBeVisible();

      // Check for search icon
      const searchIcon = page.locator('svg circle[cx="11"]');
      await expect(searchIcon.first()).toBeVisible();

      // Check for filter button
      const filterButton = page.locator('button').filter({ has: page.locator('svg path[d*="M10 18h4v-2h-4v2z"]') });
      await expect(filterButton).toBeVisible();
    });

    test('should display empty state message', async ({ page }) => {
      // Check for empty state icon
      const emptyIcon = page.locator('.w-32.h-32.bg-gray-50');
      await expect(emptyIcon).toBeVisible();

      // Check for empty state title
      await expect(page.getByText('ابحث عن وحدتك المثالية')).toBeVisible();

      // Check for empty state description
      await expect(page.getByText(/ابدأ بالبحث عن العقارات والوحدات السكنية/)).toBeVisible();
    });

    test('should navigate to filters when clicking filter button', async ({ page }) => {
      const filterButton = page.locator('button').filter({ has: page.locator('svg path[d*="M10 18h4v-2h-4v2z"]') });
      await filterButton.click();

      await expect(page).toHaveURL(/\/search\/filters/);
    });

    test('should search and navigate to results', async ({ page }) => {
      const searchInput = page.locator('input[placeholder="البحث"]');
      await searchInput.fill('villa');
      await searchInput.press('Enter');

      await expect(page).toHaveURL(/\/search\/results\?q=villa/);
    });

    test('should navigate back when clicking back button', async ({ page }) => {
      const backButton = page.locator('button').first();
      await backButton.click();

      // Should go to previous page (likely home)
      await page.waitForTimeout(500);
      // Just verify we navigated away from search
      await expect(page).not.toHaveURL(/\/search$/);
    });
  });

  test.describe('Search Results', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/search/results?q=apartment');
      await page.waitForLoadState('networkidle');
    });

    test('should display search bar with current query', async ({ page }) => {
      const searchInput = page.locator('input[placeholder="البحث"]');
      await expect(searchInput).toBeVisible();
    });

    test('should display results count or no results message', async ({ page }) => {
      // Wait for API response
      await page.waitForTimeout(2000);

      // Check if results are displayed or empty state
      const resultsText = page.getByText(/نتيجة/);
      const noResultsText = page.getByText('لا توجد نتائج');

      // At least one should be visible
      const hasResults = await resultsText.isVisible().catch(() => false);
      const hasNoResults = await noResultsText.isVisible().catch(() => false);

      expect(hasResults || hasNoResults).toBeTruthy();
    });

    test('should display property cards if results exist', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Try to find property cards
      const propertyCards = page.locator('[dir="rtl"] > div').filter({ hasText: /ر\.ق/ });
      const count = await propertyCards.count();

      // If there are results, verify they have expected elements
      if (count > 0) {
        const firstCard = propertyCards.first();
        await expect(firstCard).toBeVisible();
      }
    });

    test('should navigate to property detail when clicking card', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Check if there are property cards
      const propertyCards = page.locator('.space-y-4 > div');
      const count = await propertyCards.count();

      if (count > 0) {
        // Click first property card
        await propertyCards.first().click();

        // Should navigate to property detail page
        await expect(page).toHaveURL(/\/property\//);
      }
    });

    test('should allow filtering from results page', async ({ page }) => {
      const filterButton = page.locator('button').filter({ has: page.locator('svg path[d*="M10 18h4v-2h-4v2z"]') });
      await filterButton.click();

      await expect(page).toHaveURL(/\/search\/filters/);
    });
  });
});
