const path = require('path');
const Todo = require('./Todo');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(path.join(__dirname, '../data/todos.sqlite'));

db.run('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT)');

const repo = {
  findAll: (x) => { 
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM todos", (err, rows) => {
        if (err) {
          reject(`read error: ${err.message}`);
        } else {
          let todos = [];
          rows.forEach(row => {
            const aTodo = new Todo(row.id, row.text);
            todos.push(aTodo);
          });
          resolve(todos);
        }
      });
    });
  },
  findById: (uuid) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM todos WHERE id = ?", [uuid], (err, row) => {
        if (err) {
          reject(`read error: ${err.message}`);
        } else {
          let todo = new Todo(row.id, row.text);
          resolve(todo);
        }
      });
    });
  },
  create: (todo) => {
    return new Promise((resolve, reject)=>{
      db.serialize(() => {
        db.run("INSERT INTO todos (text) VALUES (?)", [todo.text], (err) => {
          if (err) {
            console.log(err.message);
            reject(`error: ${err.message}`);
          } else {
            console.log('todo created');
            resolve();
          }
        });
      });
    });
  },
  deleteById: (uuid) => {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM todos WHERE id = ?", [uuid], (err) => {
        if (err) {
          console.log(err.message);
          reject(`error: ${err.message}`);
        } else {
          console.log('todo deleted');
          resolve();
        }
      });
    });
  },
  update: (todo) => { 
    return new Promise((resolve, reject) => {
      db.run("UPDATE todos SET text = ? WHERE id = ?", [todo.text, todo.id], (err) => {
        if (err) {
          console.log(err.message);
          reject(`error: ${err.message}`);
        } else {
          console.log('todo updated');
          resolve();
        }
      });
    });
  },
};


module.exports = repo;