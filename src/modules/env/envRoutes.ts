import type { Routes } from '../routes'

import { getEnv } from './envController'

export const getEnvRoutes = (): {
  routes: Routes
} => {
  return {
    routes: [
      {
        method: 'GET',
        url: '/env',
        handler: getEnv,
        schema: { describe: 'Get env' },
      },
    ],
  }
}
