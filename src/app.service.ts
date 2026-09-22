import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRootJson() {
    return {
      name: 'Shadow Infection Patch Notes API',
      docs: '/api',
    };
  }

  getRootHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Shadow Infection Patch Notes API</title>
  <style>
    :root {
      --bg: #0f1218;
      --fg: #e8eaed;
      --muted: #9aa3b2;
      --accent: #7eb8ff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: "Segoe UI", system-ui, sans-serif;
      background:
        radial-gradient(ellipse at 20% 0%, #1a2740 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, #1a1528 0%, transparent 45%),
        var(--bg);
      color: var(--fg);
    }
    main {
      max-width: 28rem;
      padding: 2rem;
      text-align: center;
    }
    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    p {
      margin: 0 0 1.5rem;
      color: var(--muted);
      line-height: 1.5;
    }
    a {
      color: var(--bg);
      background: var(--accent);
      text-decoration: none;
      font-weight: 600;
      padding: 0.65rem 1.1rem;
      border-radius: 0.4rem;
      display: inline-block;
    }
    a:hover { filter: brightness(1.08); }
  </style>
</head>
<body>
  <main>
    <h1>Shadow Infection Patch Notes API</h1>
    <p>REST API for game patch notes. Explore the OpenAPI documentation to get started.</p>
    <a href="/api">Open Swagger docs</a>
  </main>
</body>
</html>`;
  }
}
