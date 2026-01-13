const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Collect console errors
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    
    // Collect page errors
    const pageErrors = [];
    page.on('pageerror', err => {
        pageErrors.push(err.message);
    });
    
    try {
        const filePath = path.join(__dirname, 'index.html');
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });
        
        // Wait for page to fully load
        await page.waitForTimeout(2000);
        
        // Check if main elements are present
        const title = await page.title();
        console.log('Page Title:', title);
        
        const heroTitle = await page.$('.hero-title');
        console.log('Hero Title Present:', !!heroTitle);
        
        const sidebar = await page.$('.sidebar');
        console.log('Sidebar Present:', !!sidebar);
        
        const mobileMenuBtn = await page.$('.mobile-menu-btn');
        console.log('Mobile Menu Button Present:', !!mobileMenuBtn);
        
        const projectsGrid = await page.$('.projects-grid');
        console.log('Projects Grid Present:', !!projectsGrid);
        
        const techItems = await page.$$('.tech-item');
        console.log('Tech Items with Icons:', techItems.length);
        
        const navLinks = await page.$$('.nav-links a');
        console.log('Navigation Links:', navLinks.length);
        
        // Test tab switching
        const tabButton = await page.$('.experience-tab[data-tab="upstatement"]');
        if (tabButton) {
            await tabButton.click();
            await page.waitForTimeout(500);
            const activeTab = await page.$('.experience-tab.active');
            const activeTabData = await activeTab.getAttribute('data-tab');
            console.log('Tab Switching Works:', activeTabData === 'upstatement');
        }
        
        // Test mobile menu in mobile viewport
        console.log('\n--- Testing Mobile Viewport ---');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        
        const mobileBtn = await page.$('#mobileMenuBtn');
        if (mobileBtn) {
            await mobileBtn.click();
            await page.waitForTimeout(300);
            const sidebarActive = await page.$('.sidebar.active');
            console.log('Mobile Menu Toggle Works:', !!sidebarActive);
        }
        
        // Report errors
        if (consoleErrors.length > 0) {
            console.log('\nConsole Errors:');
            consoleErrors.forEach(err => console.log('  -', err));
        } else {
            console.log('\nNo console errors found!');
        }
        
        if (pageErrors.length > 0) {
            console.log('\nPage Errors:');
            pageErrors.forEach(err => console.log('  -', err));
        } else {
            console.log('No page errors found!');
        }
        
        console.log('\n✓ Portfolio website updated successfully!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        await browser.close();
    }
})();
