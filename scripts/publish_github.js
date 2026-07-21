const { execSync } = require('child_process');
const fs = require('fs');

const REPO_NAME = 'control-antigravity';
const GITHUB_USER = 'Estebanico10';
const GITHUB_PASS = 'JesusesVida.10';

console.log(`[GitHub Deploy] Preparing repository ${GITHUB_USER}/${REPO_NAME}...`);

try {
  // Ensure git initialized
  execSync('git init', { stdio: 'inherit' });
  execSync('git branch -M main', { stdio: 'inherit' });
  execSync('git add .', { stdio: 'inherit' });

  try {
    execSync('git commit -m "feat: initial commit for Antigravity Remote Companion"', { stdio: 'inherit' });
  } catch (e) {
    console.log('[GitHub Deploy] Commit already clean or done.');
  }

  // Set remote URL using HTTPS format
  const remoteUrl = `https://${GITHUB_USER}:${encodeURIComponent(GITHUB_PASS)}@github.com/${GITHUB_USER}/${REPO_NAME}.git`;
  
  console.log(`[GitHub Deploy] Setting git remote 'origin'...`);
  try {
    execSync(`git remote remove origin`, { stdio: 'ignore' });
  } catch (e) {}

  execSync(`git remote add origin https://github.com/${GITHUB_USER}/${REPO_NAME}.git`, { stdio: 'inherit' });

  console.log(`====================================================`);
  console.log(`✅ Repositorio Git local preparado y listo en main.`);
  console.log(`📌 Remote URL: https://github.com/${GITHUB_USER}/${REPO_NAME}`);
  console.log(`====================================================`);
} catch (error) {
  console.error('[GitHub Deploy] Error during repository setup:', error.message);
}
