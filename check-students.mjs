import { kvGet } from './lib/kv.ts';
import 'dotenv/config';

async function main() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  
  const res = await fetch(`${url}/get/students_list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const list = JSON.parse(data.result || '[]');
  console.log(`Total students in KV: ${list.length}`);
}
main();
