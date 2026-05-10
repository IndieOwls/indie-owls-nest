import { EMAIL_CONFIG } from './config'
import type { EmailTemplateData } from './index'

export function baseHtml(title: string, body: string, data?: EmailTemplateData): string {
  const appName = data?.appName ?? 'Indie Owls Nest'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .logo { font-size: 20px; font-weight: 700; color: #18181b; margin-bottom: 24px; }
    .footer { margin-top: 24px; font-size: 12px; color: #71717a; text-align: center; }
    .footer a { color: #71717a; text-decoration: underline; }
    h1 { font-size: 20px; color: #18181b; margin: 0 0 16px; }
    p { font-size: 15px; color: #3f3f46; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; padding: 12px 24px; border-radius: 6px; background-color: ${EMAIL_CONFIG.accentColor}; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">${appName}</div>
      ${body}
    </div>
    <div class="footer">
      <p>${appName} &mdash; Built with Indie Owls Nest</p>
    </div>
  </div>
</body>
</html>`
}
