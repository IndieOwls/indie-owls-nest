import { join } from 'path'
import { existsSync } from 'fs'
import express, { json } from 'express'

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { AppModule } from './app.module'
import { API_GRAPHQL } from './constants'
import { corsOrigin, env, PORT } from './configs/main.config'
import { DEV_SANDBOX_HTML } from './modules/dev-sandbox/sandbox.html'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false })

  // Dev-only: serve Apollo Sandbox on GET to the GraphQL endpoint.
  app.use((req: any, res: any, next: any) => {
    if (env === 'development' && req.path === `/${API_GRAPHQL}` && req.method === 'GET') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.status(200).send(DEV_SANDBOX_HTML)
      return
    }
    next()
  })

  // JSON body parser with 1MB limit and raw body capture (needed for Stripe webhook).
  app.use(
    json({
      limit: '1mb',
      verify: (req: any, _, buf, encoding) => {
        req.rawBody = buf?.toString((encoding as BufferEncoding) ?? 'utf-8')
      },
    }),
  )

  // Serve uploaded files in local dev
  const uploadsPath = join(process.cwd(), 'uploads')
  if (existsSync(uploadsPath)) {
    app.use('/uploads', express.static(uploadsPath))
  }

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  })

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  await app.listen(PORT)
}
bootstrap()
  .then(() => console.info(`The server is rocking on port ${PORT}...`))
  .catch((err) => console.error(`An error occurred when starting server on port ${PORT}:`, err))
