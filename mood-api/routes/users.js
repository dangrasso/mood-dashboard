var express = require('express')
var cors = require('cors')
var router = express.Router()
var User = require('../models/User.js')

router.use(cors())

/* GET users listing. */
router.get('/', function (req, res, next) {
  User.find(function (err, moods) {
    if (err) return next(err)
    res.json(moods)
  })
})

/* GET /users/id */
router.get('/id/:id', function (req, res, next) {
  User.findById(req.params.id, function (err, post) {
    if (err) return next(err)
    res.json(post)
  })
})

/* GET /users/id */
router.get('/team/:team', function (req, res, next) {
  var query  = User.where({ team: req.params.team });
  query.find(function (err, kitten) {
    if (err) return next(err);
    if (kitten) {
      res.json(kitten);
    }
  });
})


/* PUT /users/:id */
router.put('/:id', function (req, res, next) {
  User.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err)
    res.json(post)
  })
})

/* POST /user */
router.post('/', function (req, res, next) {
  User.create(req.body, function (err, post) {
    if (err) return next(err)
    res.json(post)
  })
})

/* DELETE /users/:id */
router.delete('/:id', function (req, res, next) {
  User.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err)
    res.json(post)
  })
})

module.exports = router

