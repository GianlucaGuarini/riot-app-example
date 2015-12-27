import express from 'express'

const router = express.Router()

router.get('/index', function (req, res) {
  res.send(require('./json-data/index.json'))
})

router.get('/feed', function (req, res) {
  res.send(require('./json-data/feed.json'))
})

export default router