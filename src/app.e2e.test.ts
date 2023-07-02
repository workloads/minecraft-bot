import type { FastifyInstance } from 'fastify'

import { getApp } from './app'

describe('app', () => {
  let app: FastifyInstance
  beforeAll(async () => {
    app = await getApp()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('healthcheck', () => {
    it('Returns health check information', async () => {
      const response = await app.inject().get('/health').end()

      expect(response.json()).toMatchObject({
        healthChecks: {
          heartbeat: 'HEALTHY',
        },
      })
      expect(response.statusCode).toBe(200)
    })
  })
})
