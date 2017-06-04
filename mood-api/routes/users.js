var express = require('express')
var cors = require('cors')
var router = express.Router()
var User = require('../models/User.js')

router.use(cors())

/* GET users listing. */
router.get('/', function (req, res, next) {
  User.find(function (err, users) {
    if (err) return next(err)
    res.json(users)
  })
})

/* GET /users/id */
router.get('/id/:id', function (req, res, next) {
  User.findById(req.params.id, function (err, user) {
    if (err) return next(err)
    res.json(user)
  })
})

/* GET /users/team */
router.get('/team/:team', function (req, res, next) {
  var query  = User.where({ team: req.params.team });
  query.find(function (err, users) {
    if (err) return next(err);
    if (users) {
      res.json(users);
    }
  });
})


/* PUT /users/:id */
router.put('/:id', function (req, res, next) {
  User.findByIdAndUpdate(req.params.id, req.body, function (err, user) {
    if (err) return next(err)
    res.json(user)
  })
})

/* POST /user */
router.post('/', function (req, res, next) {
  User.create(req.body, function (err, user) {
    if (err) return next(err)
    res.json(user)
  })
})

/* DELETE /users/:id */
router.delete('/:id', function (req, res, next) {
  User.findByIdAndRemove(req.params.id, req.body, function (err, user) {
    if (err) return next(err)
    res.json(user)
  })
})

module.exports = router

