import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables manually if dot env is not initialized
import { config } from 'dotenv';
config();

const GITHUB_PAT = process.env.GITHUB_PAT || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'leetbusinesss-collab/Cyber';

async function run() {
  console.log('============= GITHUB DEPLOYMENT UTILITY =============');
  
  if (!GITHUB_PAT) {
    console.error('❌ Error: GITHUB_PAT environment variable is missing!');
    console.log('\nTo resolve this:');
    console.log('1. Go to the Settings / Secrets (Environment Variables) menu in Google AI Studio.');
    console.log('2. Add GITHUB_PAT: Your GitHub Personal Access Token (with "repo" permissions).');
    process.exit(1);
  }

  let owner = '';
  let repoName = 'cyber-realm-idle';

  if (GITHUB_REPO) {
    const parts = GITHUB_REPO.split('/');
    if (parts.length === 2 && parts[0] && parts[1]) {
      owner = parts[0];
      repoName = parts[1];
    } else {
      repoName = GITHUB_REPO;
    }
  }

  if (!owner) {
    console.log('🔍 Fetching your GitHub username using the provided token...');
    try {
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Studio-Applet'
        }
      });
      if (userRes.ok) {
        const userData = await userRes.json() as { login: string };
        owner = userData.login;
        console.log(`✅ Identified GitHub Username: ${owner}`);
      } else {
        const errText = await userRes.text();
        throw new Error(`Failed to authenticate with token: ${userRes.statusText} - ${errText}`);
      }
    } catch (e: any) {
      console.error(`❌ Could not resolve GitHub username! Verify your token has proper scopes. Details: ${e.message || e}`);
      process.exit(1);
    }
  }

  console.log(`📡 Target repository: https://github.com/${owner}/${repoName}`);
  console.log('Checking repository status on GitHub...');

  // 1. Try to check if repository exists on GitHub, and create it if it doesn't
  try {
    const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AI-Studio-Applet'
      }
    });

    if (checkRes.status === 404) {
      console.log(`📝 Repository "${repoName}" was not found. Creating it on GitHub automatically...`);
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Studio-Applet'
        },
        body: JSON.stringify({
          name: repoName,
          private: false,
          description: 'Cyber-Realm Idle incremental game build with automatic Android APK CI/CD!'
        })
      });

      if (!createRes.ok) {
        const errDetails = await createRes.text();
        throw new Error(`Failed to create repository on GitHub: ${createRes.statusText} - ${errDetails}`);
      }
      console.log(`✅ Successfully created public repository "https://github.com/${owner}/${repoName}"!`);
    } else if (checkRes.ok) {
      console.log(`✨ Repository "${repoName}" already exists on GitHub. Pushing updates...`);
    } else {
      console.warn(`⚠️ GitHub API responded with status ${checkRes.status}. Continuing anyway...`);
    }
  } catch (error: any) {
    console.warn(`⚠️ Warning checking/creating repository via GitHub API: ${error.message || error}`);
    console.log('Continuing pushing flow regardless...');
  }

  // 2. Prepare Git locally and push
  try {
    console.log('Initiating local Git workflow...');

    // Inside AI Studio workspace, we might already have a git repository or we need to recreate/initialize one
    let gitInitialized = false;
    try {
      execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
      gitInitialized = true;
    } catch {
      // Not a git repo
    }

    if (!gitInitialized) {
      console.log('Initializing a fresh Git repository locally...');
      execSync('git init', { stdio: 'inherit' });
    }

    // Configure user info so commits succeed
    console.log('Configuring local Git actor metadata...');
    execSync('git config user.name "AI Studio Builder"', { stdio: 'inherit' });
    execSync('git config user.email "builder@aistudio.google.com"', { stdio: 'inherit' });

    // Ensure we are working on the main branch
    try {
      execSync('git checkout -b main', { stdio: 'ignore' });
    } catch {
      try {
        execSync('git branch -M main', { stdio: 'inherit' });
      } catch (err: any) {
        console.log('Note: could not switch branch name directly, git will use default branch');
      }
    }

    // Add all files
    console.log('Adding files to Git index...');
    execSync('git add .', { stdio: 'inherit' });

    // Commit changes
    console.log('Creating Git commit...');
    try {
      execSync('git commit -m "Initialize project and add automatic APK GitHub Actions workflow"', { stdio: 'inherit' });
    } catch {
      console.log('No modifications to commit, proceeding...');
    }

    // Configure/Update Remote URL with the PAT Token securely embedded for auth
    const remoteUrlWithToken = `https://${owner}:${GITHUB_PAT}@github.com/${owner}/${repoName}.git`;
    
    // Check if remote origin already exists
    let remoteExists = false;
    try {
      execSync('git remote get-url origin', { stdio: 'ignore' });
      remoteExists = true;
    } catch {
      // Remote does not exist
    }

    if (remoteExists) {
      console.log('Updating GitHub remote origin...');
      execSync(`git remote set-url origin "${remoteUrlWithToken}"`, { stdio: 'inherit' });
    } else {
      console.log('Adding new GitHub remote origin...');
      execSync(`git remote add origin "${remoteUrlWithToken}"`, { stdio: 'inherit' });
    }

    // Push!
    console.log('🚀 Rocketing your code to GitHub... (This uploads everything including the APK automated build workflow!)');
    execSync('git push -u origin main --force', { stdio: 'inherit' });

    console.log('\n======================================================');
    console.log('🎉 SUCCESS! YOUR CODE HAS BEEN PUSHED TO GITHUB!');
    console.log('======================================================');
    console.log(`🔗 Link: https://github.com/${owner}/${repoName}`);
    console.log('\n🛠️  WHAT HAPPENS NEXT:');
    console.log('1. GitHub Actions will automatically start building your APK file.');
    console.log(`2. Go to: https://github.com/${owner}/${repoName}/actions`);
    console.log('3. Select the latest running or finished "Build Android APK" workflow.');
    console.log('4. Once complete (usually 2-3 minutes), scroll down to the "Artifacts" section.');
    console.log('5. Click on "Cyber-Realm-Idle-APK" to download your ready-to-install Android APK file directly to your phone!');
    console.log('======================================================\n');

  } catch (error: any) {
    console.error('❌ Error pushing code to GitHub:', error.message || error);
    process.exit(1);
  }
}

run();
