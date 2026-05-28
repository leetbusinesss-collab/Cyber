import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Force load env
import { config } from 'dotenv';
config();

const GITHUB_PAT = process.env.GITHUB_PAT || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'leetbusinesss-collab/Cyber';
const [owner, repoName] = GITHUB_REPO.split('/');

if (!GITHUB_PAT) {
  console.error('❌ Error: GITHUB_PAT env variable is missing inside pipeline execution!');
  process.exit(1);
}

async function fetchGitHub(url: string, options: any = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `token ${GITHUB_PAT}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Studio-Applet',
      ...options.headers
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API Error: ${res.status} ${res.statusText} - ${text}`);
  }
  return res;
}

// Helper to delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('🏁 STARTING AUTOMATED APK COMPILATION PIPELINE...');
  
  // 1. Commit and Push to GitHub
  try {
    console.log('Updating git remote...');
    const remoteUrlWithToken = `https://${owner}:${GITHUB_PAT}@github.com/${owner}/${repoName}.git`;
    
    // Check if git is initialized
    try {
      execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    } catch {
      execSync('git init', { stdio: 'inherit' });
    }
    
    execSync('git config user.name "AI Studio Builder"', { stdio: 'inherit' });
    execSync('git config user.email "builder@aistudio.google.com"', { stdio: 'inherit' });
    
    try {
      execSync('git checkout -b main', { stdio: 'ignore' });
    } catch {
      try {
        execSync('git branch -M main', { stdio: 'inherit' });
      } catch (e) {}
    }

    console.log('Staging files...');
    execSync('git add .', { stdio: 'inherit' });
    
    console.log('Committing changes...');
    try {
      execSync('git commit -m "Update build configuration to Node 22 for Cap 8"', { stdio: 'inherit' });
    } catch {
      console.log('No modifications to commit, pushing current HEAD...');
    }

    try {
      execSync(`git remote add origin "${remoteUrlWithToken}"`, { stdio: 'inherit' });
    } catch (e) {
      execSync(`git remote set-url origin "${remoteUrlWithToken}"`, { stdio: 'inherit' });
    }
    
    console.log('🚀 Pushing to GitHub main...');
    await new Promise<void>((resolve, reject) => {
      const p = spawn('git', ['push', '-u', 'origin', 'main', '--force']);
      p.stdout.on('data', data => process.stdout.write(`git: ${data}`));
      p.stderr.on('data', data => process.stderr.write(`git: ${data}`));
      p.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`Git push failed with code ${code}`));
      });
    });
    console.log('✅ Changes successfully pushed into GitHub repository.');

  } catch (err: any) {
    console.error('❌ Commit & Push failed:', err.message || err);
    process.exit(1);
  }

  // 2. Poll Workflow runs to wait for the triggered run
  console.log('\n📡 Waiting 5 seconds before checking workflow runs...');
  await sleep(5000);

  let runId: number | null = null;
  const startTime = Date.now();

  while (!runId) {
    try {
      const data = await fetchGitHub(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs`) as any;
      const runs = data.workflow_runs || [];
      const matchingRun = runs.find((r: any) => r.status !== 'completed' || r.created_at >= new Date(startTime - 60000).toISOString());
      
      if (matchingRun) {
        runId = matchingRun.id;
        console.log(`\n🎉 Found Active Build Workflow Run!`);
        console.log(`Run ID: ${runId}`);
        console.log(`URL: ${matchingRun.html_url}`);
        console.log(`Initial Status: ${matchingRun.status}`);
      } else {
        console.log('⏳ Waiting for GitHub runner to register the push triggered workflow...');
        await sleep(5000);
      }
    } catch (e: any) {
      console.warn('⚠️ Error listing runs:', e.message);
      await sleep(5000);
    }
  }

  // 3. Monitor compilation progress
  console.log('\n🛡️ MONITORING COMPILATION PROGRESS (Takes approx. 2-3 minutes)...');
  let attempt = 0;
  
  while (true) {
    try {
      const runDetails = await fetchGitHub(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${runId}`) as any;
      console.log(`[${new Date().toLocaleTimeString()}] Status: ${runDetails.status} | Conclusion: ${runDetails.conclusion || 'Running...'}`);
      
      if (runDetails.status === 'completed') {
        if (runDetails.conclusion === 'success') {
          console.log('\n💖 COMPILATION SUCCESSFUL! Proceeding to fetch artifact...');
          break;
        } else {
          console.error(`\n❌ COMPILATION FAILED on GitHub with conclusion: ${runDetails.conclusion}`);
          console.log('Querying failed steps...');
          try {
            const jobsData = await fetchGitHub(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${runId}/jobs`) as any;
            const job = jobsData.jobs?.[0];
            if (job) {
              console.log('Steps output:');
              for (const step of job.steps) {
                console.log(`- ${step.name}: ${step.conclusion}`);
              }
            }
          } catch {}
          process.exit(1);
        }
      }
    } catch (e: any) {
      console.warn('⚠️ Error getting run info:', e.message);
    }
    
    attempt++;
    // Wait 15 seconds between ticks
    await sleep(15000);
  }

  // 4. Download built APK artifact ZIP
  console.log('\n📥 Retreiving URL of the compiled APK zip archive...');
  let zipUrl = '';
  try {
    const artData = await fetchGitHub(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${runId}/artifacts`) as any;
    const artifacts = artData.artifacts || [];
    const apkArtifact = artifacts.find((a: any) => a.name === 'Cyber-Realm-Idle-APK');
    
    if (!apkArtifact) {
      throw new Error('Unable to find artifact named "Cyber-Realm-Idle-APK" in GitHub responses!');
    }
    
    zipUrl = apkArtifact.archive_download_url;
    console.log(`Artifact URL found: ${zipUrl}`);
    console.log(`Zip size: ${(apkArtifact.size_in_bytes / (1024 * 1024)).toFixed(2)} MB`);
  } catch (e: any) {
    console.error('❌ Failed to get artifact list:', e.message);
    process.exit(1);
  }

  // Download ZIP using Fetch
  console.log('Downloading zip archive to server...');
  const zipPath = path.join(process.cwd(), 'compiled-apk.zip');
  try {
    const res = await fetch(zipUrl, {
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'User-Agent': 'AI-Studio-Applet'
      }
    });
    if (!res.ok) throw new Error(`Download request failed: ${res.statusText}`);
    
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(zipPath, buffer);
    console.log(`✅ Artifact saved locally to: ${zipPath} (${(buffer.length / (1024*1024)).toFixed(2)} MB)`);
  } catch (err: any) {
    console.error('❌ Failed to download artifact archive:', err.message || err);
    process.exit(1);
  }

  // 5. Unpack APK ZIP if possible, else upload zip directly
  let uploadPath = zipPath;
  let uploadName = 'Cyber_Realm_Idle.zip';

  try {
    console.log('Attempting to extract APK file from zip payload...');
    execSync(`unzip -o ${zipPath} -d extracted-apk`, { stdio: 'ignore' });
    const apkFile = path.join(process.cwd(), 'extracted-apk', 'app-debug.apk');
    if (fs.existsSync(apkFile)) {
      console.log('✅ Successfully extracted raw app-debug.apk from the zip!');
      uploadPath = apkFile;
      uploadName = 'Cyber_Realm_Idle.apk';
    }
  } catch (e: any) {
    console.log('⚠️ Could not extract APK directly on server (missing unzip utility). We will upload the secure ZIP container directly instead (very easy to unzip on Android!).');
  }

  // 6. Upload compiled binary to public file hosts for dead-simple phone download!
  console.log(`\n☁️  UPLOADING COMPILED GAME TO FREE SECURE CLOUD STORAGE FOR PHONE DOWNLOAD...`);
  
  const results: string[] = [];

  // Service A: transfer.sh
  try {
    console.log('📤 Transferring to transfer.sh...');
    const fileStream = fs.readFileSync(uploadPath);
    const uploadRes = await fetch(`https://transfer.sh/${uploadName}`, {
      method: 'PUT',
      body: fileStream
    });
    if (uploadRes.ok) {
      const url = (await uploadRes.text()).trim();
      if (url.startsWith('https://')) {
        results.push(`🔹 [Transfer.sh] (No speed limit, multi-download):\n👉 ${url}`);
        console.log(`✅ successfully hosted on Transfer.sh: ${url}`);
      }
    }
  } catch (e: any) {
    console.warn('⚠️ Failure uploading to transfer.sh:', e.message || e);
  }

  // Service B: tmpfiles.org
  try {
    console.log('📤 Transferring to tmpfiles.org...');
    
    // Construct manual boundary form-data
    const boundary = '----WebKitFormBoundaryAIStudioBuild' + Math.random().toString(36).substring(2);
    const fileData = fs.readFileSync(uploadPath);
    
    let bodyHeader = `--${boundary}\r\n`;
    bodyHeader += `Content-Disposition: form-data; name="file"; filename="${uploadName}"\r\n`;
    bodyHeader += `Content-Type: application/vnd.android.package-archive\r\n\r\n`;
    
    const bodyFooter = `\r\n--${boundary}--\r\n`;
    
    const bodyBuffer = Buffer.concat([
      Buffer.from(bodyHeader, 'utf-8'),
      fileData,
      Buffer.from(bodyFooter, 'utf-8')
    ]);

    const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: bodyBuffer
    });

    if (uploadRes.ok) {
      const json: any = await uploadRes.json();
      if (json && json.data && json.data.url) {
        // Tmpfiles returns API URLs like: https://tmpfiles.org/api/v1/12345/filename
        // We need to convert it to direct browser link: https://tmpfiles.org/12345/filename
        const browserUrl = json.data.url.replace('/api/v1/', '/');
        results.push(`🔹 [Tmpfiles.org] (Direct instant download):\n👉 ${browserUrl}`);
        console.log(`✅ successfully hosted on Tmpfiles: ${browserUrl}`);
      }
    }
  } catch (e: any) {
    console.warn('⚠️ Failure uploading to tmpfiles.org:', e.message || e);
  }

  console.log('\n======================================================');
  console.log('🤖 PIPELINE OUTCOMES FOR THE USER:');
  console.log('======================================================');
  if (results.length > 0) {
    results.forEach(r => console.log(r));
  } else {
    console.log('❌ All rapid uploading hosts timed out or returned errors. Please download manually via GitHub Actions Artifacts tab on your repo.');
  }
  console.log('======================================================\n');
}

main();
