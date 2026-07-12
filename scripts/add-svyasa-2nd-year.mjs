#!/usr/bin/env node
/**
 * Bulk-adds Svyasa 2nd year students to the KV student list.
 * Run: node scripts/add-svyasa-2nd-year.mjs
 */

// Parse GitHub username from a URL (handles profile and repo links)
function extractUsername(url) {
  if (!url || url === 'No GitHub available' || url.trim() === '') return null;
  try {
    // Normalize www.github.com → github.com
    const normalized = url.replace('www.github.com', 'github.com').trim().replace(/\/$/, '');
    const parsed = new URL(normalized);
    if (!parsed.hostname.includes('github.com')) return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    // First path segment is always the username
    const username = parts[0];
    // Skip empty usernames or clearly invalid ones
    if (!username || username.length < 2) return null;
    return username;
  } catch {
    return null;
  }
}

const raw = [
  ['Abhay Tomar', 'https://github.com/uniquepersun'],
  ['Abhijit Saha', 'https://github.com/AbhijitSaha-coder'],
  ['Abhinav Kumar', 'https://github.com/Abhi-lab645'],
  ['Akshay Kumar', 'https://github.com/Akshaysisodia25'],
  ['Anant Sharma', 'https://github.com/anant2526'],
  ['Ananya Chavan', 'https://github.com/achavan7'],
  ['Anubhav Kumari', 'https://github.com/sasanubhav8873'],
  ['Apish Rana', 'https://github.com/Apishrana'],
  ['Archita Singh', 'https://github.com/archiiphobic'],
  ['ARUNIKA CHANDA', 'https://github.com/uvix9'],
  ['Aryan Chauhan', 'https://github.com/sharkie1604/fear-free-night-navigator'],
  ['Aryan Patel', 'https://github.com/AryanPatel-ui'],
  ['Ashmita Kamath', 'https://github.com/ashmita-kamath/Grade-calculator'],
  ['Asmitha M', 'https://github.com/Asmitha-M-2006'],
  ['Atul Sahu', 'https://github.com/atulvjd'],
  ['Avanish', 'https://github.com/iDarkster'],
  ['Bhavesh Sharma', 'https://github.com/bhavesh-210'],
  ['Bibhukesh Medhi', 'https://github.com/bibhukesh22'],
  ['Bikash Jha', 'https://github.com/bikash-sys'],
  ['C Harikrishna', 'https://github.com/krish29-RJ/raze'],
  ['Chinmaya S', 'https://github.com/Ar1es-XD'],
  ['Debangshu Sarkar', 'https://github.com/debangshuuu'],
  ['Dev Kumar', 'https://github.com/devx099/'],
  ['Dhashami J', 'https://github.com/Dhashamireddy/netflix-clone'],
  ['Dhiraj Rathod', 'https://github.com/dhiraj-143r'],
  ['Dhruv Mehta', 'https://github.com/zenowinged'],
  ['Divya Yadav', 'https://www.github.com/divynst-png'],
  ['Divyanshu Prakash', 'https://github.com/2102508744-png/'],
  ['Geetansh Goyal', 'https://www.github.com/geetxnshgoyal'],
  ['Harshit Chand', 'https://github.com/harshitchand998-ai/SnW-endsem-project'],
  ['Jai Agarwal', 'https://github.com/dokjawho'],
  ['Jaidev Basandrai', 'https://github.com/2102508754-sudo'],
  ['Jain Rishith Vishal', 'https://github.com/Rishitjain06'],
  ['Jothinkumar', 'https://github.com/jothinkumar'],
  ['Kartikmanmode', 'https://github.com/KartikManmode'],
  ['Krishna Chaurasia', 'https://github.com/krishnachaurasia2k'],
  ['Lay Sandeep Shah', 'https://github.com/Layyzyy'],
  ['Liya M', 'https://github.com/liyamanik-007'],
  ['Luvya Padmaj Rana', 'https://github.com/luvyarana'],
  ['Mahaveer Kumar Chhajer', 'https://github.com/Mahaveerjain-18'],
  ['Mahi Manjari Singh', 'https://github.com/techmahibot'],
  ['Mohammed Anas', 'https://github.com/2102508768-anas'],
  ['Namah Omprakash', 'https://github.com/NamahOmprakash'],
  ['Navya', 'https://github.com/2102508725-hash/Rock-Paper-Scissor.git'],
  ['Nayan Raj', 'https://github.com/nayanraj864-cmyk'],
  ['Nithyaraj Murugan Mudhaliyar', 'https://github.com/nithyarajmudhaliyar'],
  ['Paheli Choudhuri', 'https://github.com/Paheli20067'],
  ['Parijat Chakraborty', 'https://github.com/parijat-091'],
  ['Pm Mohammed Waaiz', 'https://github.com/waaiz16'],
  ['Prachi Chaurasia', 'https://github.com/2102508780-netizen'],
  ['Pranav Singh', 'https://github.com/pranavchoudhary-tech'],
  ['Prashant C G', 'https://github.com/appu-patty/harappan-'],
  ['Prateek Gupta', 'https://github.com/prateek6789-ai'],
  ['Raaj Patre', 'https://github.com/raajpatre'],
  ['Rachana Adhikary', 'https://github.com/adhikaryrachana00428-hash'],
  ['Rajveer Singh', 'https://github.com/Hell-maker07'],
  ['Ravi Sharma', 'https://github.com/ravisharma-09'],
  ['Sadiqua Parween', 'https://github.com/Sadiqua-Parween'],
  ['Sahitya Singh', 'https://www.github.com/Sahitya0805'],
  ['Sainy Verma', 'https://github.com/Sainyy56'],
  ['Saksham Kumar', 'https://github.com/sakshamkr0806'],
  ['Sakshi Shinde', 'https://github.com/ihsksa'],
  ['Samrat Sharma', 'https://github.com/samratsharma511-cmyk'],
  ['Samriddhi Raj', 'https://github.com/Samriddhi-20619'],
  ['Sanskriti Jain', 'https://github.com/sanskritijain0206-code'],
  ['Santhosh Chevuri', 'https://github.com/SanthoshChevuri-444'],
  ['Sathwik', 'https://github.com/sathwik-ace-69'],
  ['Saurabh Kumar', 'https://github.com/saurabhyuvi14-ai'],
  ['Shaaz Hemani', 'https://github.com/Shaaz-55'],
  ['Shanmuka Pranav Sai', 'https://github.com/Spidey7770'],
  ['Shivansh Gaurav', 'https://github.com/shivansh-gaurav'],
  ['Shivansh Goel', 'https://github.com/SHIVANSH-ux-ys'],
  ['Shresth Nanwani', 'https://github.com/codestack469'],
  ['Shreya Agrawal', 'https://github.com/Shreyaagrawal29'],
  ['Shreyash Ambedare', 'https://github.com/TheShadowWalker11/TheMimesis2.0'],
  ['Siddhanth Shiraguppi', 'https://github.com/Sid2676'],
  ['Sidharth Mishra', 'https://github.com/SidharthxNST'],
  ['Soham Muhury', 'https://github.com/Soham9181'],
  ['Srishti Nagpure', 'https://github.com/Srishti-Nagpure'],
  ['Srujana Gandla', 'https://github.com/iamgsrujana-png'],
  ['Sujan Y D', 'https://github.com/sujanyd/chatgpt-clone'],
  ['Sumayya Khan', 'https://github.com/k-sumayya'],
  ['Utsav Doye', 'https://github.com/UtsavDoye20122005'],
  ['Vikas Sharma', 'https://github.com/sharmavikas18'],
];

// Deduplicate by username (case-insensitive)
const seen = new Set();
const students = [];
const skipped = [];

for (const [name, url] of raw) {
  const username = extractUsername(url);
  if (!username) {
    skipped.push(`${name} — no valid GitHub URL`);
    continue;
  }
  const key = username.toLowerCase();
  if (seen.has(key)) {
    skipped.push(`${name} (${username}) — duplicate username`);
    continue;
  }
  seen.add(key);
  students.push({ github: username, year: '2nd year', campus: 'SVYASA', displayName: name });
}

console.log('\n=== SVYASA 2nd Year Students to Add ===');
console.log(`Valid: ${students.length}`);
console.log(`Skipped: ${skipped.length}`);
console.log('\nSkipped:');
skipped.forEach(s => console.log(' -', s));
console.log('\nStudents (username only):');
students.forEach(s => console.log(`  ${s.github} (${s.displayName})`));

// Output as JSON for bulk-add
console.log('\n=== JSON payload ===');
console.log(JSON.stringify(students.map(s => ({ github: s.github, year: s.year, campus: s.campus })), null, 2));
