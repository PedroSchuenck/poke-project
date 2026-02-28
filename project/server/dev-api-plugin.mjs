import { createPokedexService } from './pokedex-service.mjs'

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

function normalizePath(pathname) {
  return pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname
}

export function devApiPlugin() {
  const pokedexService = createPokedexService()

  return {
    name: 'pokedex-dev-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (!request.url?.startsWith('/api')) {
          next()
          return
        }

        const requestUrl = new URL(request.url, 'http://localhost')
        const pathname = normalizePath(requestUrl.pathname)
        const method = request.method ?? 'GET'

        try {
          if (method === 'GET' && pathname === '/api/health') {
            const summary = await pokedexService.getSummary()
            sendJson(response, 200, {
              ok: true,
              status: 'online',
              service: 'pokedex-api',
              ...summary,
            })
            return
          }

          if (method === 'GET' && pathname === '/api/types') {
            const items = await pokedexService.getTypes()
            sendJson(response, 200, { items, total: items.length })
            return
          }

          if (method === 'GET' && pathname === '/api/regions') {
            const items = await pokedexService.getRegions()
            sendJson(response, 200, { items, total: items.length })
            return
          }

          if (method === 'GET' && pathname === '/api/pokemon') {
            const query = Object.fromEntries(requestUrl.searchParams.entries())
            const payload = await pokedexService.queryPokemon(query)
            sendJson(response, 200, payload)
            return
          }

          if (method === 'GET' && pathname.startsWith('/api/pokemon/')) {
            const identifier = decodeURIComponent(pathname.replace('/api/pokemon/', '').trim())
            const pokemon = await pokedexService.getPokemonByNameOrNumber(identifier)

            if (!pokemon) {
              sendJson(response, 404, { error: 'Pokemon nao encontrado.' })
              return
            }

            sendJson(response, 200, { item: pokemon })
            return
          }

          if (method === 'POST' && pathname === '/api/refresh') {
            const dataset = await pokedexService.getDataset({ forceRefresh: true })
            sendJson(response, 200, {
              ok: true,
              message: 'Base atualizada com sucesso.',
              totalPokemon: dataset.totalPokemon,
              fetchedAt: dataset.fetchedAt,
            })
            return
          }

          sendJson(response, 404, {
            error: 'Rota nao encontrada.',
            routes: [
              'GET /api/health',
              'GET /api/types',
              'GET /api/regions',
              'GET /api/pokemon',
              'GET /api/pokemon/:idOuNome',
              'POST /api/refresh',
            ],
          })
        } catch (error) {
          sendJson(response, 500, {
            error: 'Erro interno ao processar a requisicao.',
            details: error instanceof Error ? error.message : 'Erro desconhecido',
          })
        }
      })
    },
  }
}
