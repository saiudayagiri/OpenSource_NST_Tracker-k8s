async function main() {
  const query = 'is:pr+author:Dreamstick9+-user:Dreamstick9+stars:>=5';
  const url = `https://api.github.com/search/issues?q=${query}`;
  console.log('Querying:', url);
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Total count:', data.total_count);
    if (data.items) {
      console.log('Items found:', data.items.map((i: any) => i.html_url));
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

main();
