import express from 'express'

const router = express.Router()

// fake json api
// these data are supposed to come from db queries...

router.get('/index', function (req, res) {
  res.send(require('./json-data/index.json'))
})

router.get('/feed', function (req, res) {
  res.send(require('./json-data/feed.json'))
})

router.get('/login', function (req, res) {
  res.send(require('./json-data/login.json'))
})

router.get('/gallery', function (req, res) {
  res.send(require('./json-data/gallery.json'))
})

export default router