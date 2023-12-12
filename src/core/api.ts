import Fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import { MineflayerBot } from './bot'

import { commands } from '../core/handler'

class Api {
  public fastify: FastifyInstance

  constructor(instance: MineflayerBot) {
    this.fastify = Fastify()

    this.fastify.get(
      '/behavior',
      async function (
        req: FastifyRequest<{
          Querystring: {
            type: string
            block: string | undefined
          }
        }>,
        rep,
      ) {
        instance.log.info(instance.locale.api_message_received)

        const command = req.query.type
        const block = req.query.block

        try {
          commands[command](instance, { username: 'Console', argument: block })
          rep.send({ statusCode: 'success', code: 0, message: instance.locale.api_command_sent })
        } catch (error) {
          rep.send({
            statusCode: 'success',
            code: 0,
            message: instance.locale.bot_command_fail_notfound.replace('%s', command),
          })
        }
      },
    )

    this.fastify.get('/health', async function (_req, res) {
      instance.send_to_discord('Console', 'health')

      res.send({
        // external IP's should be implemented here.
        bot: {
          api: 'localhost:' + ':' + instance.getSettings().interfacePort,
          inventory: 'localhost' + ':' + instance.getSettings().inventoryPort,
          viewer: 'localhost' + ':' + instance.getSettings().viewPort,
        },
        server: {
          host: instance.getBot()._client.socket.address(),
          version: instance.getBot().version,
        },
      })
    })

    this.fastify.listen({ port: instance.getSettings().interfacePort }, async function (err) {
      if (err) {
        instance.log.info(instance.locale.api_interface_fail)
        process.exit(1)
      }

      instance.log.info(
        instance.locale.api_interface_start,
        `localhost:${instance.getSettings().interfacePort}`,
      )
    })
  }
}

export { Api }
