const { successResponse } = require('../_helpers/reponses')
module.exports = { getItems, getItem }

const items = ['please', 'thank you', 'pardon me', 'excuse me', 'sorry']

function getItems(req, res) {
  return successResponse(res, 'Items fetched successfully', items)
}

function getItem(req, res) {
  const random = Math.floor(Math.random() * 5)
  const data = items[random]
  return successResponse(res, 'Item fetched successfully', data)
}