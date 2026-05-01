const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting browser automation test...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/google-chrome'
  });
  
  try {
    const page = await browser.newPage();
    
    // Test 1: Load the homepage
    console.log('Test 1: Loading homepage...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    if (!title.includes('Top Notch Insurance Brokers')) {
      throw new Error('Incorrect page title');
    }
    
    console.log('Browser automation test completed!');
    
  } catch (error) {
    console.error('Browser automation test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
