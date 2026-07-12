const url = "https://flexible-mutt-137338.upstash.io";
const token = "gQAAAAAAAhh6AAIgcDJjYTExMzRlMTFhODA0MTY1YTY5OThlMjM3YjIyMjBmYw";
fetch(`${url}/get/summary_cache:all`, {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json()).then(data => {
  const cache = JSON.parse(data.result || '{"summaries":[]}');
  console.log(`Total summaries in cache: ${cache.summaries.length}`);
});
