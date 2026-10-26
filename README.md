# Quillpage
1. Install Node 18+ (nodejs.org).
2. In this folder run: ANTHROPIC_API_KEY=your-key node server.js   (Windows PowerShell: $env:ANTHROPIC_API_KEY="your-key"; node server.js)
3. Open http://localhost:3000
Data is saved in a "data" folder created next to server.js. Back it up. Do not publish this folder's data/ or .env.
For a public launch use a host with a persistent disk, HTTPS and NODE_ENV=production.
