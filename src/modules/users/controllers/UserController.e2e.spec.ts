import type { FastifyInstance } from 'fastify'
import { expect } from 'vitest'

import { getApp } from '../../../app'
import type { CREATE_USER_BODY_SCHEMA_TYPE } from '../schemas/userSchemas'

describe('UserController', () => {
  let app: FastifyInstance
  beforeAll(async () => {
    app = await getApp()
  })
  afterAll(async () => {
    await app.close()
  })

  describe('POST /users', () => {
    it('validates email format', async () => {
      const response = await app
        .inject()
        .post('/users')
        .body({ name: 'dummy', email: 'test' } as CREATE_USER_BODY_SCHEMA_TYPE)
        .end()

      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual(
        expect.objectContaining({
          details: {
            error: [
              {
                code: 'invalid_string',
                message: 'Invalid email',
                path: ['email'],
                validation: 'email',
              },
            ],
          },
          message: 'Invalid params',
        }),
      )
    })
  })
})
