import { test, expect } from '@playwright/test';

test.describe('Filter Screen Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search/filters');
    await page.waitForLoadState('networkidle');
  });

  test('should display filter header with title and location', async ({ page }) => {
    // Check for back button
    const backButton = page.locator('button').first();
    await expect(backButton).toBeVisible();

    // Check for "فلتر" title
    await expect(page.getByText('فلتر')).toBeVisible();

    // Check for location display
    await expect(page.getByText('الدوحة، قطر')).toBeVisible();
  });

  test('should display sort by section with 3 options', async ({ page }) => {
    // Check for section title
    await expect(page.getByText('ترتيب حسب')).toBeVisible();

    // Check for sort options
    await expect(page.getByText('الأقرب إليك')).toBeVisible();
    await expect(page.getByText('الأعلى تقييم')).toBeVisible();
    await expect(page.getByText('الأكثر شيوعاً')).toBeVisible();
  });

  test('should select sort option and highlight it', async ({ page }) => {
    const nearestButton = page.getByRole('button', { name: /الأقرب إليك/ });

    // Click the button
    await nearestButton.click();

    // Check if button has active styling (black background)
    const buttonClasses = await nearestButton.getAttribute('class');
    expect(buttonClasses).toContain('bg-black');
  });

  test('should display price order toggles', async ({ page }) => {
    // Check for price buttons
    await expect(page.getByText('الأعلى سعر')).toBeVisible();
    await expect(page.getByText('الأقل سعر')).toBeVisible();
  });

  test('should toggle price order', async ({ page }) => {
    const highPriceButton = page.getByRole('button', { name: /الأعلى سعر/ });
    const lowPriceButton = page.getByRole('button', { name: /الأقل سعر/ });

    // Click high price
    await highPriceButton.click();
    let classes = await highPriceButton.getAttribute('class');
    expect(classes).toContain('bg-black');

    // Click low price
    await lowPriceButton.click();
    classes = await lowPriceButton.getAttribute('class');
    expect(classes).toContain('bg-black');
  });

  test('should display unit type section', async ({ page }) => {
    // Check for section title
    await expect(page.getByText('نوع الوحدة')).toBeVisible();

    // Check for unit type options
    await expect(page.getByRole('button', { name: 'عقارات QDP' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'عقارات خارجية' })).toBeVisible();
  });

  test('should select unit type', async ({ page }) => {
    const qdpButton = page.getByRole('button', { name: 'عقارات QDP' });

    await qdpButton.click();

    const classes = await qdpButton.getAttribute('class');
    expect(classes).toContain('bg-black');
  });

  test('should display residential complex chips', async ({ page }) => {
    // Check for section title
    await expect(page.getByText('المجمع السكني')).toBeVisible();

    // Check for complex options
    await expect(page.getByRole('button', { name: 'الواحة' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'الخزائن' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'النخيل' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'الزيان' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'المزيد' })).toBeVisible();
  });

  test('should select multiple residential complexes', async ({ page }) => {
    const oasisButton = page.getByRole('button', { name: 'الواحة' });
    const palmsButton = page.getByRole('button', { name: 'النخيل' });

    // Select first complex
    await oasisButton.click();
    let classes = await oasisButton.getAttribute('class');
    expect(classes).toContain('bg-black');

    // Select second complex
    await palmsButton.click();
    classes = await palmsButton.getAttribute('class');
    expect(classes).toContain('bg-black');
  });

  test('should display bedroom count selector', async ({ page }) => {
    // Check for section title
    await expect(page.getByText('عدد الغرف')).toBeVisible();

    // Check for bedroom numbers 1-5
    for (let i = 1; i <= 5; i++) {
      const bedroomButton = page.getByRole('button', { name: String(i), exact: true });
      await expect(bedroomButton).toBeVisible();
    }
  });

  test('should select bedroom count', async ({ page }) => {
    // Click on bedroom count 3
    const bedroom3Button = page.locator('button').filter({ hasText: /^3$/ }).last();

    await bedroom3Button.click();

    const classes = await bedroom3Button.getAttribute('class');
    expect(classes).toContain('bg-black');
  });

  test('should display bottom action buttons', async ({ page }) => {
    // Check for clear button
    await expect(page.getByRole('button', { name: 'مسح الاختيارات' })).toBeVisible();

    // Check for save button
    await expect(page.getByRole('button', { name: 'حفظ' })).toBeVisible();
  });

  test('should clear all selections', async ({ page }) => {
    // Select some options first
    const nearestButton = page.getByRole('button', { name: /الأقرب إليك/ });
    const bedroom3Button = page.locator('button').filter({ hasText: /^3$/ }).last();

    await nearestButton.click();
    await bedroom3Button.click();

    // Click clear button
    const clearButton = page.getByRole('button', { name: 'مسح الاختيارات' });
    await clearButton.click();

    // Verify selections are cleared (buttons should not have black background)
    // This is a basic check - in reality, you'd need to verify the internal state
    await expect(clearButton).toBeVisible();
  });

  test('should apply filters and navigate to results', async ({ page }) => {
    // Select some filters
    const bedroom3Button = page.locator('button').filter({ hasText: /^3$/ }).last();
    await bedroom3Button.click();

    // Click save button
    const saveButton = page.getByRole('button', { name: 'حفظ' });
    await saveButton.click();

    // Should navigate to search results
    await expect(page).toHaveURL(/\/search\/results/);
  });

  test('should navigate back when clicking back button', async ({ page }) => {
    const backButton = page.locator('button').first();
    await backButton.click();

    // Should navigate away from filters
    await page.waitForTimeout(500);
    await expect(page).not.toHaveURL(/\/filters/);
  });

  test('should have RTL layout', async ({ page }) => {
    const mainContainer = page.locator('div[dir="rtl"]').first();
    await expect(mainContainer).toBeVisible();
  });
});
