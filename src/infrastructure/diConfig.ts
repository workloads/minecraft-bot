import type { AwilixContainer, Resolver } from 'awilix'
import { asClass, asFunction, Lifetime } from 'awilix'
import type { FastifyInstance, FastifyLoggerInstance } from 'fastify'
import type P from 'pino'
import { pino } from 'pino'

import { FakeStoreApiClient } from '../integrations/FakeStoreApiClient'
import { UserService } from '../modules/users/services/UserService'

import type { Config } from './config'
import { getConfig } from './config'
import type { ErrorReporter } from './errors/errorReporter'

export type ExternalDependencies = {
  app?: FastifyInstance
  logger?: P.Logger
}
export const SINGLETON_CONFIG = { lifetime: Lifetime.SINGLETON }

export type DependencyOverrides = Partial<DiConfig>

export function registerDependencies(
  diContainer: AwilixContainer,
  dependencies: ExternalDependencies = {},
  dependencyOverrides: DependencyOverrides = {},
): void {
  const diConfig: DiConfig = {
    logger: asFunction(() => dependencies.logger ?? pino(), SINGLETON_CONFIG),

    config: asFunction(() => {
      return getConfig()
    }, SINGLETON_CONFIG),

    userService: asClass(UserService, SINGLETON_CONFIG),

    errorReporter: asFunction(() => {
      return {
        // todo
        report: (report) => console.log(report),
      } satisfies ErrorReporter
    }),

    fakeStoreApiClient: asClass(FakeStoreApiClient, SINGLETON_CONFIG),
  }
  diContainer.register(diConfig)

  for (const [dependencyKey, dependencyValue] of Object.entries(dependencyOverrides)) {
    diContainer.register(dependencyKey, dependencyValue)
  }
}

type DiConfig = Record<keyof Dependencies, Resolver<unknown>>

export interface Dependencies {
  config: Config
  logger: FastifyLoggerInstance & P.Logger

  userService: UserService

  // vendor-specific dependencies
  errorReporter: ErrorReporter
  fakeStoreApiClient: FakeStoreApiClient
}

declare module '@fastify/awilix' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Cradle extends Dependencies {}

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface RequestCradle extends Dependencies {}
}
