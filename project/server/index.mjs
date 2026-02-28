import { createServer } from 'node:http'
import { URL } from 'node:url'
import { createPokedexService } from './pokedex-service.mjs'

const port = Number.parseInt(process.env.PORT ?? '3001', 10)
const pokedexService = createPokedexService()

function setCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(payload))
}

function normalizePath(pathname) {
  return pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname
}

const server = createServer(async (request, response) => {
  setCorsHeaders(response)

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  const requestUrl = new URL(request.url ?? '/', `http://localhost:${port}`)
  const pathname = normalizePath(requestUrl.pathname)

  try {
    if (request.method === 'GET' && pathname === '/api/health') {
      const summary = await pokedexService.getSummary()
      sendJson(response, 200, {
        ok: true,
        status: 'online',
        service: 'pokedex-api',
        ...summary,
      })
      return
    }

    if (request.method === 'GET' && pathname === '/api/types') {
      const items = await pokedexService.getTypes()
      sendJson(response, 200, { items, total: items.length })
      return
    }

    if (request.method === 'GET' && pathname === '/api/regions') {
      const items = await pokedexService.getRegions()
      sendJson(response, 200, { items, total: items.length })
      return
    }

    if (request.method === 'GET' && pathname === '/api/pokemon') {
      const query = Object.fromEntries(requestUrl.searchParams.entries())
      const payload = await pokedexService.queryPokemon(query)
      sendJson(response, 200, payload)
      return
    }

    if (request.method === 'GET' && pathname.startsWith('/api/pokemon/')) {
      const identifier = decodeURIComponent(pathname.replace('/api/pokemon/', '').trim())
      const pokemon = await pokedexService.getPokemonByNameOrNumber(identifier)

      if (!pokemon) {
        sendJson(response, 404, { error: 'Pokemon nao encontrado.' })
        return
      }

      sendJson(response, 200, { item: pokemon })
      return
    }

    if (request.method === 'POST' && pathname === '/api/refresh') {
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

server.listen(port, () => {
  console.log(`Pokedex API rodando em http://localhost:${port}`)

  pokedexService
    .getDataset()
    .then((dataset) => {
      console.log(`Base carregada: ${dataset.totalPokemon} Pokemon.`)
    })
    .catch((error) => {
      console.error(`Falha ao carregar base inicial: ${error.message}`)
    })
})
