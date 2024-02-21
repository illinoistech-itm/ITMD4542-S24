var express = require('express');
var router = express.Router();
const todosController = require('../controllers/todosController');
const { body } = require('express-validator');

/* GET todos listing. */
router.get('/', todosController.todos_list);

/* GET todos add */
router.get('/add', todosController.todos_create_get);

/* POST todos add */
router.post('/add', 
body('todoText').trim().notEmpty().withMessage('Todo text can not be empty!'), 
body('todoEmail').trim().not().isEmpty().withMessage('Todo email address can not be empty!').isEmail().withMessage('Email must be a valid email address!'),
todosController.todos_create_post);

/* GET a todo */
router.get('/:uuid', todosController.todos_detail);

/* GET todos delete */
router.get('/:uuid/delete', todosController.todos_delete_get);

/* POST todos delete */
router.post('/:uuid/delete', todosController.todos_delete_post);

/* GET todos edit */
router.get('/:uuid/edit', todosController.todos_edit_get);

/* POST todos add */
router.post('/:uuid/edit', todosController.todos_edit_post);

module.exports = router;
