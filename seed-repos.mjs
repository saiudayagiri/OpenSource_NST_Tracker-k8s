import 'dotenv/config';
import { getStudentsKV } from './lib/kv-students.ts';
import { readProfileCache } from './lib/profile-cache.ts';
import { getRepoCache, saveRepoCache } from './lib/repo-cache.ts';
import { execSync } from 'child_process';

async function main() {
  const token = execSync('gh auth token').toString().trim();
  console.log("Loading students...");
  const students = await getStudentsKV();
  const repoCache = await getRepoCache();
  
  const uniqueRepos = new Set();
  
  for (const s of students) {
    const cached = await readProfileCache(s.github);
    if (!cached || !cached.prs) continue;
    
    for (const pr of cached.prs) {
      if (!pr.repository_url) continue;
      const repoFullName = pr.repository_url.replace('https://api.github.com/repos/', '');
      if (!repoCache[repoFullName]) {
        uniqueRepos.add(repoFullName);
      }
    }
  }
  
  console.log(`Found ${uniqueRepos.size} missing repos. Fetching metadata...`);
  
  let count = 0;
  let updated = false;
  
  for (const repo of uniqueRepos) {
    count++;
    if (count % 50 === 0) console.log(`Processed ${count}/${uniqueRepos.size}...`);
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`, { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const stars = data.stargazers_count || 0;
        const forks = data.forks_count || 0;
        repoCache[repo] = { stars, forks, valid: stars >= 5 };
        updated = true;
      } else if (res.status === 404) {
        repoCache[repo] = { stars: 0, forks: 0, valid: false };
        updated = true;
      }
    } catch (err) {
      console.error(`Failed to fetch ${repo}:`, err.message);
    }
  }
  
  if (updated) {
    await saveRepoCache(repoCache);
    console.log("Repo cache successfully updated!");
  } else {
    console.log("No new repos found.");
  }
}

main().catch(console.error);
