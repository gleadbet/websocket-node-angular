const { Router } = require('express')
const router = Router()

const itemRoute = require('../items/items.route')

const routes = [
  {
    path: '/items',
    route: itemRoute
  }
]

routes.forEach(route => {
  router.use(route.path, route.route)
})

module.exports = router
