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
                        type: 'mine' | 'come'
                        block: string | undefined
                    }
                }>,
                rep,
            ) {
                instance.log(instance.strings.msg_api_received)
                const command = req.query.type

                if (command === 'mine') {
                    if (instance.getStates().isMining) {
                        rep.send({
                            statusCode: 'failed',
                            code: 1,
                            message: instance.strings.msg_miner_already_started,
                        })
                        return
                    }

                    instance.getStates().block = req.query.block
                    commands[command](instance, {username: 'console', argument: req.query.block})
                    rep.send({ statusCode: 'success', code: 0, message: 'mining ' + req.query.block })
                    return
                }

                commands[command](instance, {username: 'console', argument: undefined})
                rep.send({ statusCode: 'success', code: 0, message: instance.strings.msg_api_sent })
            },
        )

        this.fastify.get('/health', async function (_req, res) {
            instance.reportToDiscord('Console', 'health')
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

        this.fastify.listen({ port: instance.getSettings().interfacePort }, async function (err, address) {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            instance.logger.info(instance.strings.msg_api_success, address)
        })
    }
}

export { Api }