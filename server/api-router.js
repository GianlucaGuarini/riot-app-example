import express from 'express'

const router = express.Router()

router.get('/index', function (req, res) {
  res.send(require('./json-data/index.json'))
})

export default router