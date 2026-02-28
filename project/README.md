# Pokedex API + Frontend Moderno

Projeto completo com:

- API Node (`server/index.mjs`) para listar Pokemon de todas as regioes (dados vindos da PokeAPI).
- Filtros por tipo, regiao, geracao, busca por nome/numero e faixa de stats.
- Ordenacao por nome, numero, stats, peso, altura etc.
- Paginacao.
- Interface React moderna consumindo a API.

## Como rodar

1. Instale dependencias:

```bash
npm install
```

2. Para desenvolvimento integrado (frontend + API no mesmo comando):

```bash
npm run dev
```

A API fica disponivel no mesmo host do Vite, por exemplo:

- `http://localhost:5173/api/health`

3. Opcional: subir API standalone em outra porta:

```bash
npm run dev:api
```

Frontend: `http://localhost:5173`  
API standalone: `http://localhost:3001`

## Endpoints principais

- `GET /api/health`
- `GET /api/types`
- `GET /api/regions`
- `GET /api/pokemon`
- `GET /api/pokemon/:idOuNome`
- `POST /api/refresh`

## Query params do `/api/pokemon`

- `q`: busca por nome ou numero
- `type`: tipo (`fire`, `water`, etc)
- `region`: regiao (`kanto`, `johto`, ...)
- `generation`: geracao (`1`..`9`)
- `sortBy`: `number`, `name`, `total`, `hp`, `attack`, `defense`, `specialAttack`, `specialDefense`, `speed`, `weight`, `height`, `baseExperience`
- `order`: `asc` ou `desc`
- `page`: pagina (padrao `1`)
- `limit`: itens por pagina (padrao `24`, max `120`)
- `minTotal`, `maxTotal`
- `minHp`, `maxHp`
- `minAttack`, `maxAttack`
- `minDefense`, `maxDefense`
- `minSpeed`, `maxSpeed`

### Exemplo

```http
GET /api/pokemon?type=fire&sortBy=total&order=desc&page=1&limit=20
```

## Cache de dados

A API salva cache local em `server/.cache/pokedex-cache.json`.

Variaveis opcionais:

- `PORT` (default `3001`)
- `POKEDEX_CACHE_TTL_HOURS` (default `24`)
- `POKEDEX_FETCH_CONCURRENCY` (default `35`)
- `POKEAPI_LIST_LIMIT` (default `2000`)
