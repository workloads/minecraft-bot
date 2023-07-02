import type { Either } from '@lokalise/node-core'
import { executeAsyncAndHandleGlobalErrors } from '@lokalise/node-core'
import type { FastifyInstance } from 'fastify'

export type HealthCheck = (app: FastifyInstance) => Promise<Either<Error, true>>

export const wrapHealthCheck = (app: FastifyInstance, healthCheck: HealthCheck) => {
  return async () => {
    const response = await healthCheck(app)
    if (response.error) {
      throw response.error
    }
  }
}

export function registerHealthChecks(app: FastifyInstance) {
  app.addHealthCheck('heartbeat', () => true)
}

export async function runAllHealthchecks(app: FastifyInstance) {
  return executeAsyncAndHandleGlobalErrors(() => Promise.all([]), false)
}
