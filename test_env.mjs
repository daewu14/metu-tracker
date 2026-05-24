import 'dotenv/config';
const creds = process.env.GOOGLE_CREDENTIALS;
console.log("Raw from env:", creds.substring(0, 100));
try {
  const parsed = JSON.parse(creds);
  console.log("Parsed key:", parsed.private_key.substring(0, 50));
  if (parsed.private_key.includes('\\n')) {
    console.log("Contains literal backslash n!");
  } else if (parsed.private_key.includes('\n')) {
    console.log("Contains actual newline!");
  }
} catch (e) {
  console.log("Parse error:", e);
}
