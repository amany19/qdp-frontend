import { test, expect } from '@playwright/test';

test('Check if home page shows properties', async ({ page }) => {
  // Go to home page
  await page.goto('/home');

  // Wait for page load
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: 'test-results/home-page.png', fullPage: true });

  // Check if loading spinner appears first
  const spinner = page.locator('.animate-spin');
  console.log('Spinner visible:', await spinner.isVisible().catch(() => false));

  // Wait for properties to load
  await page.waitForTimeout(3000);

  // Check for "وحدات مميزة" section
  const featuredSection = page.getByText('وحدات مميزة');
  console.log('Featured section visible:', await featuredSection.isVisible().catch(() => false));

  // Check for property cards
  const propertyCards = page.locator('.space-y-4 > div');
  const count = await propertyCards.count();
  console.log('Property cards count:', count);

  // Check if any property titles are visible
  const propertyTitles = page.locator('h3.font-bold.text-lg');
  const titleCount = await propertyTitles.count();
  console.log('Property titles count:', titleCount);

  // Check for price elements
  const prices = page.locator('text=/ر\\.ق/');
  const priceCount = await prices.count();
  console.log('Price elements count:', priceCount);

  // Check for empty state message
  const emptyMessage = page.getByText('لا توجد وحدات متاحة حالياً');
  console.log('Empty message visible:', await emptyMessage.isVisible().catch(() => false));

  // Get page content for debugging
  const content = await page.content();
  console.log('Page contains "properties":', content.includes('properties'));
  console.log('Page contains API URL:', content.includes('http://localhost:3001'));
});

test('Check search page', async ({ page }) => {
  await page.goto('/search/results?q=apartment');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'test-results/search-page.png', fullPage: true });

  const propertyCards = page.locator('.space-y-4 > div');
  const count = await propertyCards.count();
  console.log('Search results count:', count);

  const emptyMessage = page.getByText('لا توجد نتائج');
  console.log('Empty search message:', await emptyMessage.isVisible().catch(() => false));
});
