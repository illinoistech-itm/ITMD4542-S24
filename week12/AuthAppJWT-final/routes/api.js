var express = require('express');
var router = express.Router();
const {MongoClient, ObjectId} = require('mongodb');
const passport = require('passport');

const mongoURL = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@4542-sp24.csvctv1.mongodb.net/authappdemo?retryWrites=true&w=majority`;
const client = new MongoClient(mongoURL);

async function run() {
  await client.connect();
  return 'Connected to the MongoDB server...';
}

run()
.then(console.log)
.catch(console.error);

/* GET planets. */
router.get('/planets', passport.authenticate('jwt', {session: false}), async function(req, res, next) {
  try {
    const coll = client.db('sample_guides').collection('planets');
    const filter = {};
    const cursor = coll.find(filter);
    const result = await cursor.toArray();
    res.json(result);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
});

/* GET a planet. */
router.get('/planets/:id', async function(req, res, next) {
  try {
    const coll = client.db('sample_guides').collection('planets');
    const filter = {_id: new ObjectId(req.params.id)};
    const result = await coll.findOne(filter);
    res.json(result);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
});

module.exports = router;
