const fs = require('fs');
const url = "https://flexible-mutt-137338.upstash.io";
const token = "gQAAAAAAAhh6AAIgcDJjYTExMzRlMTFhODA0MTY1YTY5OThlMjM3YjIyMjBmYw";
fetch(`${url}/get/students_list`, {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json()).then(data => {
  const list = JSON.parse(data.result || '[]');
  console.log(`Total students in KV: ${list.length}`);
});
