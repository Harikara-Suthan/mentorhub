const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = execSync('find src -type f -name "*.tsx"').toString().trim().split('\n');

for (const file of files) {
  if (file.includes('Login.tsx')) continue; // Skip Login.tsx to preserve password manager functionality

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Regex to match <input ... > and <textarea ... >
  // We want to add autoComplete="off" if it's not already there
  content = content.replace(/<(input|textarea)(\s[^>]*)>/gi, (match, tag, attributes) => {
    // If it already has autoComplete, skip
    if (attributes.match(/autoComplete=/i)) {
      return match;
    }
    
    // Add autoComplete="off"
    return `<${tag} autoComplete="off"${attributes}>`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
