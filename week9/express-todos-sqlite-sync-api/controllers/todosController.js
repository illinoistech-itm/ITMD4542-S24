const { validationResult } = require('express-validator');
const todosRepo = require('../src/todosSQLiteRepository');
const Todo = require('../src/Todo');

/* GET todos listing. */
exports.todos_list = function(req, res, next) {
    const data = todosRepo.findAll();
    res.format({
      html: function(){
        res.render('todos', { title: 'Express Todos', todos: data });
      },
      json: function(){
        res.json({ todos: data });
      },
    });
};
  
  /* GET todos add */
  exports.todos_create_get = function(req, res, next) {
    res.render('todos_add', { title: 'Add a Todo'} );
  };
  
  /* POST todos add */
  exports.todos_create_post = function(req, res, next) {
    //console.log(req.body);
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.format({
        html: function(){
          res.render('todos_add', { title: 'Add a Todo', msg: result.array() });
        },
        json: function(){
          res.status('400').json({err: result.array()});
        },
      }); 
    } else {
      const newTodo = new Todo('', req.body.todoText);
      todosRepo.create(newTodo);
      res.format({
        html: function(){
          res.redirect('/todos');
        },
        json: function(){
          res.status('201').json({msg: 'todo created'});
        },
      });
      
    }
  };
  
  /* GET a todo */
  exports.todos_detail = function(req, res, next) {
    const todo = todosRepo.findById(req.params.uuid);
    if (todo) {
      res.render('todo', { title: 'Your Todo', todo: todo} );
    } else {
      res.redirect('/todos');
    }
  };
  
  /* GET todos delete */
  exports.todos_delete_get = function(req, res, next) {
    const todo = todosRepo.findById(req.params.uuid);
    res.render('todos_delete', { title: 'Delete Todo', todo: todo} );
  };
  
  /* POST todos delete */
  exports.todos_delete_post = function(req, res, next) {
    todosRepo.deleteById(req.params.uuid);
    res.redirect('/todos');
  };
  
  /* GET todos edit */
  exports.todos_edit_get = function(req, res, next) {
    const todo = todosRepo.findById(req.params.uuid);
    res.render('todos_edit', { title: 'Edit Todo', todo: todo} );
  };
  
  /* POST todos edit */
  exports.todos_edit_post = function(req, res, next) {
    //console.log(req.body);
    if (req.body.todoText.trim() === '') {
      const todo = todosRepo.findById(req.params.uuid);
      res.render('todos_edit', {title: 'Edit Todo', msg: 'Todo text can not be empty!', todo: todo});
    } else {
      const updatedTodo = new Todo(req.params.uuid, req.body.todoText);
      todosRepo.update(updatedTodo);
      res.redirect('/todos');
    }
  };