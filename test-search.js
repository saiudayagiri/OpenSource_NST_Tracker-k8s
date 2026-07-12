const authors = Array.from({length: 15}).map((_, i) => `user${i}`);
const query = `is:pr (${authors.map(u => `author:${u}`).join(' OR ')})`;
console.log("Query length:", query.length);
fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}`).then(res => res.json()).then(console.log);
