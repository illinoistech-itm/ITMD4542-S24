const { MongoClient, ObjectId } = require('mongodb');
const Todo = require('../src/Todo');

const url = process.env.MONGODB_URL;

const client = new MongoClient(url);

async function run() {
    await client.connect();
    return 'Connected to the MongoDB server...';
}

run().then(console.log).catch(console.error);

const repo = {
    findAll: async () => {
        let todos = [];
        const todosColl = client.db('express-todos-mongodb').collection('todos');
        const cursor = todosColl.find({});
        for await (const doc of cursor) {
            const aTodo = new Todo(doc._id.toString(), doc.text);
            todos.push(aTodo);
        }
        return todos;
    },
    findById: async (uuid) => {
        const todosColl = client.db('express-todos-mongodb').collection('todos');
        const filter = {_id: new ObjectId(uuid)};
        const doc = await todosColl.findOne(filter);
        return new Todo(doc._id.toString(), doc.text);
    },
    create: async (todo) => {
        const doc = {text: todo.text};
        const todosColl = client.db('express-todos-mongodb').collection('todos');
        const result = await todosColl.insertOne(doc);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
    },
    deleteById: async (uuid) => {
        const todosColl = client.db('express-todos-mongodb').collection('todos');
        const filter = {_id: new ObjectId(uuid)};
        const result = await todosColl.deleteOne(filter);
        if (result.deletedCount === 1) {
            console.log('Successfully delted one document');
        } else {
            console.log('No documents matched the query. Delted 0 documents');
        }
    },
    update: async (todo) => {
        const todosColl = client.db('express-todos-mongodb').collection('todos');
        const filter = {_id: new ObjectId(todo.id)};
        const updateDoc = {
            $set: {
                text: todo.text,
            }
        };
        const result = await todosColl.updateOne(filter, updateDoc);
        console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);
    },

};

module.exports = repo;