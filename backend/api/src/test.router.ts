import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify'

const testRouter: RouteOptions = {
    method: 'GET',
    url: '/query',
    handler: function (request: FastifyRequest, reply: FastifyReply): unknown {
        return request.query;
    }
}


export default testRouter