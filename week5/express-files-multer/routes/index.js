var express = require('express');
const multer = require('multer');
const fs = require('node:fs');
var router = express.Router();
const upload = multer({dest: 'tmp/'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/file-upload', function(req, res, next) {
  res.render('file-upload', { title: 'Express File Upload' });
});

/* POST home page. */
router.post('/file-upload', upload.array('userFiles'), function(req, res, next) {
  console.log(req.body);
  console.log(req.files);
  if (req.files.length > 0) {
    req.files.forEach((f) => {
      fs.renameSync(`${f.path}`, `uploads/${f.filename.slice(0, 6)}-${f.originalname}`);
    });
  }
  res.send('files uploaded see console');
});

module.exports = router;
