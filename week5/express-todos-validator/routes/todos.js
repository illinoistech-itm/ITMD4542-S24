var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const todosRepo = require('../src/todosFileRepository');

/* GET todos listing. */
router.get('/', function(req, res, next) {
  const data = todosRepo.findAll();
  res.render('todos', { title: 'Express Todos', todos: data } );
});

/* GET todos add */
router.get('/add', function(req, res, next) {
  res.render('todos_add', { title: 'Add a Todo'} );
});

/* POST todos add */
router.post('/add', 
body('todoText').trim().notEmpty().withMessage('Todo text can not be empty!'), 
body('todoEmail').trim().not().isEmpty().withMessage('Todo email address can not be empty!').isEmail().withMessage('Email must be a valid email address!'),
function(req, res, next) {
  //console.log(req.body);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.render('todos_add', {title: 'Add a Todo', msg: result.array()});
  } else {
    todosRepo.create({text: req.body.todoText.trim()});
    res.redirect('/todos');
  }
});

/* GET a todo */
router.get('/:uuid', function(req, res, next) {
  const todo = todosRepo.findById(req.params.uuid);
  if (todo) {
    res.render('todo', { title: 'Your Todo', todo: todo} );
  } else {
    res.redirect('/todos');
  }
  
});

/* GET todos delete */
router.get('/:uuid/delete', function(req, res, next) {
  const todo = todosRepo.findById(req.params.uuid);
  res.render('todos_delete', { title: 'Delete Todo', todo: todo} );
});

/* POST todos delete */
router.post('/:uuid/delete', function(req, res, next) {
  todosRepo.deleteById(req.params.uuid);
  res.redirect('/todos');
});

/* GET todos edit */
router.get('/:uuid/edit', function(req, res, next) {
  const todo = todosRepo.findById(req.params.uuid);
  res.render('todos_edit', { title: 'Edit Todo', todo: todo} );
});

/* POST todos add */
router.post('/:uuid/edit', function(req, res, next) {
  //console.log(req.body);
  if (req.body.todoText.trim() === '') {
    const todo = todosRepo.findById(req.params.uuid);
    res.render('todos_edit', {title: 'Edit Todo', msg: 'Todo text can not be empty!', todo: todo});
  } else {
    const updatedTodo = {id: req.params.uuid, text: req.body.todoText.trim()};
    todosRepo.update(updatedTodo);
    res.redirect('/todos');
  }
});

module.exports = router;
