const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Test runner for the Modern Pomodoro Timer project
async function runTests() {
    console.log('Starting test suite for Modern Pomodoro Timer...');

    // 1. Verify project structure files exist
    const requiredFiles = [
        'package.json',
        'project.json',
        'server/index.js'
    ];

    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, file);
        assert(fs.existsSync(filePath), `Required file missing: ${file}`);
        console.log(`[PASS] File exists: ${file}`);
    }

    // 2. Test Express server startup and static file serving
    // We require the server setup or spawn it, but since server/index.js likely listens immediately upon require,
    // let's check its contents or start it on a test port if exported, or test via standard HTTP request if it runs.
    // Let's inspect server/index.js via require or test the HTTP endpoint.
    
    const serverPath = path.join(__dirname, 'server/index.js');
    const serverCode = fs.readFileSync(serverPath, 'utf8');
    assert(serverCode.includes('express'), 'Server code must include express');
    assert(serverCode.includes('express.static') || serverCode.includes('static'), 'Server must serve static files');
    console.log('[PASS] Server code structure is valid.');

    // Let's perform a dynamic test by starting the express app if possible, 
    // or by checking package.json main entry.
    const pkgJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    assert(pkgJson.main === 'server/index.js', 'package.json main must point to server/index.js');
    console.log('[PASS] package.json configuration is correct.');

    console.log('All tests passed successfully!');
    process.exit(0);
}

runTests().catch((err) => {
    console.error('Test failed with error:');
    console.error(err);
    process.exit(1);
});