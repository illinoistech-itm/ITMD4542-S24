var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('todos', { title: 'Express from todos' });
});

router.get('/new', function(req, res, next) {
  res.render('todos', { title: 'New Express from todos' });
});

module.exports = router;
