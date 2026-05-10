import { initBotId } from 'botid/client/core'

initBotId({
  protect: [
    { path: '/api/leads', method: 'POST' },
    { path: '/api/demands', method: 'POST' },
    { path: '/api/collaborations', method: 'POST' },
  ],
})
