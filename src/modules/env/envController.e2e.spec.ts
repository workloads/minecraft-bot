import type { FastifyInstance } from 'fastify'

import { getApp } from '../../app'

describe('envController', () => {
  let app: FastifyInstance
  beforeAll(async () => {
    app = await getApp()
  })
  afterAll(async () => {
    await app.close()
  })

  describe('GET /env', () => {
    it('returns env', async () => {
      const response = await app.inject().get('/env').end()

      expect(response.statusCode).toBe(200)
    })
  })
})
