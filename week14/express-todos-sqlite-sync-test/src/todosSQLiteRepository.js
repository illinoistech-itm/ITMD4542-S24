const path = require('node:path');
const Todo = require('../src/Todo');
const betterSqlite3 = require('better-sqlite3');

const db = new betterSqlite3(path.join(__dirname, '../data/todos.sqlite'), { verbose: console.log });

const createStmt = db.prepare("CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT)");
createStmt.run();

const repo = {
    findAll: () => {
        const stmt = db.prepare("SELECT * FROM todos");
        const rows = stmt.all();
        let todos = [];
        rows.forEach((row) => {
            const aTodo = new Todo(row.id, row.text);
            todos.push(aTodo);
        });
        return todos;
    },
    findById: (uuid) => {
        const stmt = db.prepare("SELECT * FROM todos WHERE id = ?");
        const row = stmt.get(uuid);
        return new Todo(row.id, row.text);
    },
    create: (todo) => {
        const stmt = db.prepare("INSERT INTO todos (text) VALUES (?)");
        const info = stmt.run(todo.text);
        console.log(`Todo created with id: ${info.lastInsertRowid}`);
    },
    deleteById: (uuid) => {
        const stmt = db.prepare("DELETE FROM todos WHERE id = ?");
        const info = stmt.run(uuid);
        console.log(`Rows affected: ${info.changes}`);
    },
    update: (todo) => {
        const stmt = db.prepare("UPDATE todos SET text = ? WHERE id = ?");
        const info = stmt.run(todo.text, todo.id);
        console.log(`Rows affected: ${info.changes}`);
    },

};

module.exports = repo;