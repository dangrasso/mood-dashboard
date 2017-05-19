var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Log = require('../models/Log.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  Log.find(function (err, logs) {
    if (err) return next(err);
    res.json(logs);
  });
});

/* GET /logs/id */
router.get('/:id', function(req, res, next) {
  Log.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* PUT /logs/:id */
router.put('/:id', function(req, res, next) {
  Log.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* POST /logs*/
router.post('/', function(req, res, next) {
  Log.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE /logs/:id */
router.delete('/:id', function(req, res, next) {
  Log.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
