#!/usr/bin/env node

/**
 * Netlify Setup Script
 * This script connects a GitHub repository to Netlify using the Netlify CLI
 * Assumes Netlify CLI is already installed and authenticated
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const config = {
  githubRepo: 'https://github.com/edbns/liftorzing.git',
  publishDir: '.',
  functionsDir: 'netlify/functions',
  buildCommand: '', // No build command for static site
  envVars: [
    { key: 'HUGGING_FACE_TOKEN', value: '' } // Value will be set on Netlify
  ]
};

// Console styling
const style = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Helper functions
const logStep = (message) => console.log(`\n${style.bright}${style.cyan}Step: ${message}${style.reset}`);
const logSuccess = (message) => console.log(`${style.green}✓ ${message}${style.reset}`);
const logWarning = (message) => console.log(`${style.yellow}⚠ ${message}${style.reset}`);
const logError = (message) => console.log(`${style.red}✗ ${message}${style.reset}`);

const runCommand = (command, errorMessage) => {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    logError(errorMessage || 'Command failed');
    logError(error.message);
    process.exit(1);
  }
};

// Main function to deploy site
async function deployToNetlify() {
  console.log(`\n${style.bright}${style.cyan}=== Netlify Deployment Setup ===${style.reset}\n`);
  console.log('This script will connect your GitHub repository to Netlify');

  // Check if Netlify CLI is installed
  logStep('Checking for Netlify CLI');
  try {
    execSync('netlify --version', { encoding: 'utf8', stdio: 'pipe' });
    logSuccess('Netlify CLI is installed');
  } catch (error) {
    logError('Netlify CLI not found. Please install it with: npm install -g netlify-cli');
    process.exit(1);
  }

  // Verify authentication status
  logStep('Verifying Netlify authentication');
  try {
    const status = execSync('netlify status', { encoding: 'utf8', stdio: 'pipe' });
    if (!status.includes('Logged in')) {
      logWarning('Not logged in to Netlify');
      console.log('Please run "netlify login" first and then run this script again.');
      process.exit(1);
    }
    logSuccess('Successfully authenticated with Netlify');
  } catch (error) {
    logError('Failed to verify Netlify authentication status');
    console.log('Please run "netlify login" first and then run this script again.');
    process.exit(1);
  }

  // Initialize new site
  logStep('Initializing new Netlify site');
  
  try {
    // Create new site connected to GitHub
    logStep('Connecting to GitHub repository');
    console.log(`Repository: ${config.githubRepo}`);
    
    runCommand(
      `netlify sites:create --name liftorzing --manual --with-ci`,
      'Failed to create Netlify site'
    );
    logSuccess('Created Netlify site');

    // Get site ID from netlify.toml if it exists
    let siteId = '';
    try {
      const initOutput = runCommand('netlify link', 'Failed to get site information');
      const match = initOutput.match(/Site Id: ([a-zA-Z0-9-]+)/);
      if (match && match[1]) {
        siteId = match[1];
        logSuccess(`Linked to site ID: ${siteId}`);
      }
    } catch (error) {
      logWarning('Could not retrieve site ID. Continuing anyway.');
    }

    // Configure build settings
    logStep('Setting up build configuration');
    runCommand(
      `netlify build:settings:set -d ${config.publishDir} -f ${config.functionsDir} ${config.buildCommand ? `-c "${config.buildCommand}"` : ''}`,
      'Failed to configure build settings'
    );
    logSuccess('Build settings configured');

    // Set up continuous deployment from GitHub
    logStep('Setting up continuous deployment from GitHub');
    runCommand(
      `netlify init --manual --force`,
      'Failed to initialize GitHub connection'
    );
    logSuccess('GitHub connection initialized');

    // Set environment variables
    if (config.envVars.length > 0) {
      logStep('Setting up environment variables');
      for (const { key } of config.envVars) {
        console.log(`Setting ${key} (value will be configured on Netlify dashboard)`);
        runCommand(
          `netlify env:set ${key} "placeholder-configure-in-dashboard"`,
          `Failed to set environment variable ${key}`
        );
      }
      logSuccess('Environment variables configured. Remember to set actual values in the Netlify dashboard');
    }

    // Final steps and information
    console.log(`\n${style.bright}${style.green}=== Setup Complete ===${style.reset}`);
    console.log('\nImportant next steps:');
    console.log('1. Go to the Netlify dashboard to complete GitHub integration');
    console.log('2. Set up the actual value for HUGGING_FACE_TOKEN in the Netlify dashboard');
    console.log('   Environment variables > Edit variables > Enter actual token');
    console.log('\nNetlify dashboard: https://app.netlify.com/');
    
    if (siteId) {
      console.log(`Direct site link: https://app.netlify.com/sites/${siteId}`);
    }

  } catch (error) {
    logError('Setup failed');
    logError(error.message);
  } finally {
    rl.close();
  }
}

// Run the deployment function
deployToNetlify();