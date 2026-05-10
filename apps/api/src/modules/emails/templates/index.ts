import { baseHtml } from './base'

export interface EmailTemplateData {
  appName?: string
  appUrl?: string
}

export function welcomeHtml(data: EmailTemplateData): string {
  return baseHtml(
    'Welcome',
    `<h1>Welcome aboard!</h1>
<p>Thanks for signing up. We're glad to have you.</p>
<p>If you didn't create this account, you can safely ignore this email.</p>`,
    data,
  )
}

export function verifyEmailHtml(link: string, data: EmailTemplateData): string {
  return baseHtml(
    'Verify your email',
    `<h1>Verify your email address</h1>
<p>Click the button below to verify your email address. This link expires in 24 hours.</p>
<p style="text-align:center"><a class="btn" href="${link}">Verify Email</a></p>
<p>If you didn't sign up, you can safely ignore this email.</p>`,
    data,
  )
}

export function passwordResetHtml(link: string, data: EmailTemplateData): string {
  return baseHtml(
    'Reset your password',
    `<h1>Reset your password</h1>
<p>Click the button below to reset your password. This link expires in 1 hour.</p>
<p style="text-align:center"><a class="btn" href="${link}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
    data,
  )
}
