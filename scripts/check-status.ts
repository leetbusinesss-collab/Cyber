import { config } from 'dotenv';
config();

const GITHUB_PAT = process.env.GITHUB_PAT || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'leetbusinesss-collab/Cyber';

async function main() {
  const [owner, repo] = GITHUB_REPO.split('/');
  console.log(`📡 Checking latest workflow runs for ${owner}/${repo}...`);

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=1`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AI-Studio'
      }
    });

    if (!res.ok) {
      console.error(`❌ HTTP Error: ${res.status} ${res.statusText}`);
      return;
    }

    const data = await res.json() as any;
    const run = data.workflow_runs?.[0];

    if (!run) {
      console.log('No runs found yet.');
      return;
    }

    console.log('\n======================================================');
    console.log('💚 CURRENT ACTIVE GITHUB BUILD STATUS:');
    console.log('======================================================');
    console.log(`Run Name:   ${run.name}`);
    console.log(`Triggered By: Push to [${run.head_branch}] branch`);
    console.log(`Commit Msg:   "${run.head_commit?.message}"`);
    console.log(`Current Status: ${run.status.toUpperCase()}`);
    console.log(`Conclusion:     ${run.conclusion ? run.conclusion.toUpperCase() : 'IN PROGRESS ⏳'}`);
    console.log(`Created At:     ${run.created_at}`);
    console.log(`Web Link:       ${run.html_url}`);

    if (run.conclusion === 'failure') {
      try {
        const jobsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${run.id}/jobs`, {
          headers: {
            'Authorization': `Bearer ${GITHUB_PAT}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'AI-Studio'
          }
        });
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json() as any;
          console.log('\n--- 🚨 FAILURE INVESTIGATION ---');
          for (const job of jobsData.jobs || []) {
            console.log(`Job: ${job.name} -> ${job.conclusion.toUpperCase()}`);
            for (const step of job.steps || []) {
              if (step.conclusion === 'failure') {
                console.log(`  ❌ Failed Step: "${step.name}" (Step Number: ${step.number})`);
                
                // Fetch direct log lines for this failed step if possible
                const logsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/jobs/${job.id}/logs`, {
                  headers: {
                    'Authorization': `Bearer ${GITHUB_PAT}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'AI-Studio'
                  }
                });
                if (logsRes.ok) {
                  const logContent = await logsRes.text();
                  console.log('\n--- 📝 ERROR LOG TAIL ---');
                  const lines = logContent.split('\n');
                  // Capture lines near the failure
                  console.log(lines.slice(-30).join('\n'));
                }
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
    console.log('======================================================\n');

  } catch (err: any) {
    console.error('API Error:', err.message || err);
  }
}

main();
