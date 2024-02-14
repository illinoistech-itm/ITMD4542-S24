const todosRepo = require('../src/todosSQLiteAsyncRepository');
const { validationResult } = require('express-validator');
const Todo = require('../src/Todo');

/* GET users listing. */
exports.todos_list = async function(req, res, next) {
  const data = await todosRepo.findAll();
  console.log(data);
  res.render('todos', { title: 'Express Todos', todos: data });
};

/* GET create todo form. */
exports.todos_create_get = function(req, res, next) {
  res.render('todos_add', { title: 'Add a Todo' });
};

/* POST create todo. */
exports.todos_create_post = async function(req, res, next) {
  //console.log(req.body);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.render('todos_add', { title: 'Add a Todo', msg: result.array() });
  } else {
    const newTodo = new Todo('', req.body.todoText);
    await todosRepo.create(newTodo);
    res.redirect('/todos');
  }
};

/* GET single todo. */
exports.todos_detail = async function(req, res, next) {
  const todo = await todosRepo.findById(req.params.uuid);
  if (todo) {
    res.render('todo', { title: 'Your Todo', todo: todo });
  } else {
    res.redirect('/todos');
  }
};

/* GET delete todo form. */
exports.todos_delete_get = async function(req, res, next) {
  const todo = await todosRepo.findById(req.params.uuid);
  res.render('todos_delete', { title: 'Delete Todo', todo: todo });
};

/* POST delete todo. */
exports.todos_delete_post = async function(req, res, next) {
  await todosRepo.deleteById(req.params.uuid);
  res.redirect('/todos');
};

/* GET edit todo form. */
exports.todos_edit_get = async function(req, res, next) {
  const todo = await todosRepo.findById(req.params.uuid);
  res.render('todos_edit', { title: 'Edit Todo', todo: todo });
};

/* POST edit todo. */
exports.todos_edit_post = async function(req, res, next) {
  //console.log(req.body);
  if (req.body.todoText.trim() === '') {
    const todo = await todosRepo.findById(req.params.uuid);
    res.render('todos_edit', 
      { title: 'Edit Todo', msg: 'Todo text can not be empty!', todo: todo }
    );
  } else {
    const updatedTodo = new Todo(req.params.uuid, req.body.todoText.trim());
    await todosRepo.update(updatedTodo);
    res.redirect(`/todos/${req.params.uuid}`);
  }
};