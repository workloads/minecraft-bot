import mineflayer from 'mineflayer'
import { fastify, instance } from '../../index'
import { FastifyRequest } from 'fastify'

/**
 * @param {mineflayer.Bot} bot
 */

declare module 'mineflayer' {
  interface BotEvents {
    'chat:come': (options: string[]) => Promise<void> | void
  }
}

module.exports = (bot: mineflayer.Bot) => {
  fastify.get(
    '/behavior',
    async function (
      req: FastifyRequest<{
        Querystring: {
          type: 'mine' | 'come'
          block: string | undefined
        }
      }>,
      rep,
    ) {
      instance.logger.info('Received API call')

      const command = req.query.type

      if (command === 'mine') {
        if (instance.getStates().isMining) {
          rep.send({
            statusCode: 'failed',
            code: 1,
            message: 'the bot is already in the process of mining.',
          })
          return
        }

        instance.getStates().block = req.query.block

        instance.goMine(req.query.block)
        rep.send({ statusCode: 'success', code: 0, message: 'mining ' + req.query.block })
        instance.sendToDiscord('Mining command has been executed with web interface.')
        return
      }
      const options: string[] = [
        instance.getSettings().operators[0] ? instance.getSettings().operators[0] : '',
      ]
      bot.emit(`chat:${command}`, options)
      instance.sendToDiscord(`${command} command has been executed with web interface.`)
      rep.send({ statusCode: 'success', code: 0, message: 'The command was sent successfully.' })
    },
  )

  fastify.get('/health', async function (_req, res) {
    instance.sendToDiscord('Health was requested via the web interface.')
    res.send({
      bot: {
        api: 'localhost:' + ':' + instance.getSettings().interfacePort,
        inventory: 'localhost' + ':' + instance.getSettings().inventoryPort,
        viewer: 'localhost' + ':' + instance.getSettings().viewPort,
      },
      server: {
        host: bot._client.socket.address + ':' + bot._client.socket.remotePort,
        version: bot.version,
      },
    })
  })

  fastify.listen({ port: instance.getSettings().interfacePort }, async function (err, address) {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    instance.logger.info(`Web Interface is up and listening to port: ${address}`)
  })
}
