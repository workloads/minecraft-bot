import type { FastifyReply, FastifyRequest } from 'fastify'

export const getEnv = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
  return reply.send({
    data: {
      ...process.env,
    },
  })
}
