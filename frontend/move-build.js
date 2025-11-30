/**
 * Cross-platform script to move React build to backend/static
 * Works on Windows, Mac, and Linux
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
const staticDir = path.join(__dirname, '..', 'backend', 'static');

console.log(' Moving build to backend/static...');

// Function to recursively delete directory
function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

// Function to recursively copy directory
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // Check if build directory exists
  if (!fs.existsSync(buildDir)) {
    console.error(' Build directory not found!');
    process.exit(1);
  }

  // Delete old static directory if it exists
  if (fs.existsSync(staticDir)) {
    console.log('  Removing old static directory...');
    deleteDirectory(staticDir);
  }

  // Copy build to static
  console.log(' Copying build to static...');
  copyDirectory(buildDir, staticDir);

  // Delete build directory
  console.log('  Cleaning up build directory...');
  deleteDirectory(buildDir);

  console.log('Build successfully moved to backend/static!');
  console.log(' You can now run: cd ../backend && pipenv run python app.py');
} catch (error) {
  console.error('❌ Error moving build:', error.message);
  process.exit(1);
}