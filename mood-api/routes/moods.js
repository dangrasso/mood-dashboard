var express = require('express')
var cors = require('cors')
var router = express.Router()
var Mood = require('../models/Mood.js')

router.use(cors())

/* GET users listing. */
router.get('/', function (req, res, next) {
  Mood.find(function (err, moods) {
    if (err) return next(err)
    res.json(moods)
  })
})

/* GET /moods/id */
router.get('/:id', function (req, res, next) {
  Mood.findById(req.params.id, function (err, post) {
    if (err) return next(err)
    res.json(post)
  })
})

/* PUT /moods/:id */
router.put('/:id', function (req, res, next) {
  Mood.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err)
    res.json(post)
  })
})

/* POST /moods */
router.post('/', function (req, res, next) {
  Mood.create(req.body, function (err, post) {
    if (err) return next(err)
    res.json(post)
  })
})

/* DELETE /moods/:id */
router.delete('/:id', function (req, res, next) {
  Mood.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err)
    res.json(post)
  })
})

module.exports = router
