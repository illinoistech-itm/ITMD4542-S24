const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const Todo = require('../src/Todo');
const db = new Map();

//db.set('b5bb0f35-e7ff-4700-8921-e13c95fa8be9', {text: 'This is todo 1 text', id: 'b5bb0f35-e7ff-4700-8921-e13c95fa8be9'});
//db.set('15628bf8-a38c-48ad-8e49-cde1583bc4e1', {text: 'This is todo 2 text', id: '15628bf8-a38c-48ad-8e49-cde1583bc4e1'});

const loadData = () => {
    const jsonData = fs.readFileSync(path.join(__dirname, '../data/todos.json'));
    const todosArray = JSON.parse(jsonData);
    todosArray.forEach((element) => {
        const aTodo = new Todo(element[1].id, element[1].text);
        db.set(aTodo.id, aTodo);
    });
    console.log(db);
};
const saveData = () => {
    const stringifyData = JSON.stringify(Array.from(db));
    fs.writeFileSync(path.join(__dirname, '../data/todos.json'), stringifyData);
};

const repo = {
    findAll: () => Array.from(db.values()),
    findById: (uuid) => db.get(uuid),
    create: (todo) => {
        todo.id = crypto.randomUUID();
        db.set(todo.id, todo);
        saveData();
    },
    deleteById: (uuid) => {
        db.delete(uuid);
        saveData();
    },
    update: (todo) => {
        db.set(todo.id, todo);
        saveData();
    },

};

loadData();

module.exports = repo;