import { test, expect } from '@playwright/test';

test.describe('Flappy Bird Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the game title and start message', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Flappy Bird');
    await expect(page.locator('p')).toContainText('Click or Press Space to Start');
  });

  test('should have a bird element', async ({ page }) => {
    await expect(page.locator('.bird')).toBeVisible();
  });

  test('should display score', async ({ page }) => {
    await expect(page.locator('.score')).toContainText('Score: 0');
  });

  test('should start game when clicking', async ({ page }) => {
    await page.locator('.game-container').click();
    
    // Wait a moment for the game to start
    await page.waitForTimeout(100);
    
    // Check that start message disappears (it's in a .message div that gets hidden)
    await expect(page.locator('.message')).not.toBeVisible();
    
    // Score should still be visible
    await expect(page.locator('.score')).toBeVisible();
  });

  test('should start game when pressing space', async ({ page }) => {
    await page.keyboard.press('Space');
    
    // Wait a moment for the game to start
    await page.waitForTimeout(100);
    
    // Check that start message disappears (it's in a .message div that gets hidden)
    await expect(page.locator('.message')).not.toBeVisible();
    
    // Score should still be visible
    await expect(page.locator('.score')).toBeVisible();
  });

  test('should show pipes after game starts', async ({ page }) => {
    await page.locator('.game-container').click();
    
    // Wait a bit for pipes to appear
    await page.waitForTimeout(2000);
    
    // Check that pipes are present
    await expect(page.locator('.pipe')).toHaveCount(2); // At least top and bottom pipe
  });

  test('bird should move when clicking', async ({ page }) => {
    // Get initial bird position
    const bird = page.locator('.bird');
    const initialTop = await bird.evaluate(el => el.style.top);
    
    // Start the game
    await page.locator('.game-container').click();
    
    // Wait a moment for bird to fall
    await page.waitForTimeout(100);
    
    // Click to make bird jump
    await page.locator('.game-container').click();
    
    // Wait a moment and check position changed
    await page.waitForTimeout(100);
    const newTop = await bird.evaluate(el => el.style.top);
    
    expect(newTop).not.toBe(initialTop);
  });

  test('should show game over when bird hits boundaries', async ({ page }) => {
    await page.locator('.game-container').click();
    
    // Wait for the bird to fall and hit the bottom
    await page.waitForTimeout(3000);
    
    // Game over message should appear
    await expect(page.locator('h2')).toContainText('Game Over!');
    await expect(page.locator('p').filter({ hasText: 'Click or Press Space to Restart' })).toBeVisible();
  });

  test('should restart game after game over', async ({ page }) => {
    // Start and let game end
    await page.locator('.game-container').click();
    await page.waitForTimeout(3000);
    
    // Verify game over
    await expect(page.locator('h2')).toContainText('Game Over!');
    
    // Restart game
    await page.locator('.game-container').click();
    
    // Should show start message again
    await expect(page.locator('h2')).toContainText('Flappy Bird');
    await expect(page.locator('.score')).toContainText('Score: 0');
  });

  test('game area should have correct dimensions', async ({ page }) => {
    const gameArea = page.locator('.game-area');
    
    await expect(gameArea).toHaveCSS('width', '400px');
    await expect(gameArea).toHaveCSS('height', '600px');
  });

  test('should handle multiple jumps', async ({ page }) => {
    await page.locator('.game-container').click();
    
    // Make multiple jumps
    for (let i = 0; i < 5; i++) {
      await page.locator('.game-container').click();
      await page.waitForTimeout(200);
    }
    
    // Bird should still be in the game area
    await expect(page.locator('.bird')).toBeVisible();
  });
});