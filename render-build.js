// This script is executed when Render.com runs the default npm command
// It detects if it's running on Render.com and runs the appropriate build command

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Detecting environment...');

// Check if running on Render.com
const isRender = process.env.RENDER === 'true';

if (isRender) {
  console.log('Running on Render.com, executing build command...');
  
  try {
    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    // Build client
    console.log('Building client...');
    execSync('cd client && npm install && npm run build', { stdio: 'inherit' });
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Error during build:', error);
    process.exit(1);
  }
} else {
  console.log('Not running on Render.com, please use npm run build or npm run dev');
}
