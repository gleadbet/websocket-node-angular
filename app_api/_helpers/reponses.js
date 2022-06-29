module.exports = { successResponse, errorResponse }

function successResponse(res, msg = 'Done successfully', data = null, statusCode = 200,) {
  return res.status(statusCode).json({ success: true, msg, data })
}

function errorResponse(res, msg = 'There is an error', statusCode = 400,) {
  return res.status(statusCode).json({ success: false, msg })
}