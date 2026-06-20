// test_verification.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const url = 'https://corporategptv2.web.app/';
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for chat input to appear
  const chatInputSelector = 'textarea[data-testid="chat-input"]';
  await page.waitForSelector(chatInputSelector, { timeout: 15000 });
  const testMessage = 'Hello, this is an automated test.';
  await page.fill(chatInputSelector, testMessage);
  await page.keyboard.press('Enter');

  // Wait for a bot reply
  const replySelector = '.chat-message.bot';
  await page.waitForSelector(replySelector, { timeout: 20000 });
  const botReply = await page.textContent(replySelector);

  // Capture screenshot of chat area
  const chatArea = await page.$('.chat-container');
  await chatArea.screenshot({ path: 'chat_test.png' });

  // Image Studio workflow (optional – trigger a sample generation)
  try {
    const imageTab = await page.$('button[data-testid="image-studio-tab"]');
    if (imageTab) {
      await imageTab.click();
      await page.waitForSelector('textarea[data-testid="image-prompt"]', { timeout: 5000 });
      await page.fill('textarea[data-testid="image-prompt"]', 'A futuristic corporate logo');
      await page.click('button[data-testid="generate-image"]');
      await page.waitForSelector('.generated-image', { timeout: 30000 });
      const img = await page.$('.generated-image img');
      await img.screenshot({ path: 'generated_image.png' });
    }
  } catch (e) {
    console.error('Image studio step failed:', e);
  }

  // Save results
  const fs = require('fs');
  const result = { url, testMessage, botReply };
  fs.writeFileSync('verification_result.json', JSON.stringify(result, null, 2));

  await browser.close();
})();
