export const DEV_SANDBOX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GraphQL Playground — Indie Owls Nest</title>
  <meta name="robots" content="noindex" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #sandbox { height: 100vh; width: 100vw; }
  </style>
</head>
<body>
  <div id="sandbox"></div>
  <script src="https://embeddable-sandbox.cdn.apollographql.com/v2/embeddable-sandbox.umd.production.min.js"></script>
  <script>
    new window.EmbeddedSandbox({
      target: '#sandbox',
      initialEndpoint: window.location.origin + '/api/v1/graphql',
      initialState: {
        includeCookies: true,
      },
      hideCookieToggle: true,
      persistExplorerState: true,
      displayOptions: {
        theme: 'dark',
        docsPanelState: 'open',
        showHeadersAndEnvVars: true,
      },
    })
  </script>
</body>
</html>`
