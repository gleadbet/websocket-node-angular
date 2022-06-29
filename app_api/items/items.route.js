const { Router } = require('express')
const router = Router()

const { getItems, getItem } = require('./items.controller')

router.get('/', getItems)
router.get('/next', getItem)

module.exports = router
