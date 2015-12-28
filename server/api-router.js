import express from 'express'

const router = express.Router()

router.get('/index', function (req, res) {
  res.send(require('./json-data/index.json'))
})

router.get('/feed', function (req, res) {
  res.send(require('./json-data/feed.json'))
})

router.get('/login', function (req, res) {
  res.send(require('./json-data/login.json'))
})

export default router