var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/file-upload', function(req, res, next) {
  res.render('file-upload', { title: 'Express File Upload' });
});

/* POST home page. */
router.post('/file-upload', function(req, res, next) {
  console.log(req.body);
  console.log(req.files);
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send('No files were uploaded');
  }
  if (req.files.userFiles) {
    if (Array.isArray(req.files.userFiles)) {
      console.log('is array');
      req.files.userFiles.forEach(element => {
        element.mv(`uploads/${element.name}`);
      });
    } else {
      console.log('is object');
      req.files.userFiles.mv(`uploads/${req.files.userFiles.name}`);
    }
  }
  // if (req.files.length > 0) {
  //   req.files.forEach((f) => {
  //     fs.renameSync(`${f.path}`, `uploads/${f.filename.slice(0, 6)}-${f.originalname}`);
  //   });
  // }
  res.send('files uploaded see console');
});

module.exports = router;
