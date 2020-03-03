var express = require('express')
var router = express.Router()
var multer = require('multer')
var fs = require('fs')
var Path = require('path')
var uniqid = require('uniqid')
var config = require('../config')
var db = require('../db')
var _resultCode = config.result_code
var _displayResults = config._displayResults
var menufile = 'menu.json'
// http://zobaba.com/photographer/
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads')
    }

    var user_id = req.body.user_id
    // var dir = 'uploads/' + user_id;
    var dir = 'uploads/' + user_id
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }

    // var GalleryName = req.body.GalleryName;
    var gallery_id = req.body.gallery_id
    // var dir = 'uploads/' + user_id + '/' + gallery_id;
    var dir = 'uploads/' + user_id + '/' + gallery_id
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    var filename = req.params.filename
    if (filename === undefined) {
      filename = menufile
    }
    // console.log(file);
    // var type = path.extname(file.originalname);
    cb(null, filename)
  }
})

var maxSize = config.upload_file_max_size
var upload = multer({ storage: storage, limits: { fileSize: maxSize } })

/** ************************ file uplaod and download route *************************/
/* file upload : POST */
router.post('/files/:filename', upload.single('file'), function (req, res) {
  if (req.file) {
    var user_id = req.body.user_id
    var GalleryName = req.body.GalleryName
    var gallery_id = req.body.gallery_id
    var imageStatus = req.body.imageStatus
    var filename = req.params.filename

    var collection = db.get().collection(config.imageCollection)
    var query = {
      user_id: user_id,
      GalleryName: GalleryName,
      filename: filename,
      gallery_id: gallery_id
    }
    collection.find(query).toArray(function (_err, docs) {
      if (docs.length === 0) {
        query = {
          image_id: uniqid.time(),
          user_id: user_id,
          gallery_id: gallery_id,
          GalleryName: GalleryName,
          filename: filename,
          imageStatus: imageStatus
        }
        collection.insertOne(query, function (_err, inserted) {
          // res.json(_displayResults(_resultCode.IMAGE_UPLOADED_SUCCESS, 'Successfully uploaded', true));
        })
      } else {
        // res.status(201).json(_displayResults(_resultCode.IMAGE_ALREADY_EXIST, 'This image already exist'));
      }
    })
    res.json(
      _displayResults(
        _resultCode.FILE_UPLOAD_SUCCESS,
        'Successfully uploaded',
        true
      )
    )
  } else {
    res
      .status(405)
      .json(
        _displayResults(
          _resultCode.NO_SELECTED_UPLOAD_FILE,
          "Please select file(key='file') to upload"
        )
      )
  }
})

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    var article_id = req.body.article_id
    var dir = 'uploads/articles/' + article_id
    console.log(dir)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    var filename = req.params.filename
    if (filename === undefined) {
      filename = menufile
    }
    cb(null, filename)
  }
})

var maxSize = config.upload_file_max_size
var upload = multer({ storage: storage, limits: { fileSize: maxSize } })

/** ************************ file uplaod and download route *************************/
/* file upload : POST */
router.post(
  '/files/otherarticleimg/:filename',
  upload.single('file'),
  function (req, res) {
    if (req.file) {
      var article_id = req.body.article_id
      var filename = req.params.filename

      var collection = db.get().collection(config.articleimagesCollection)
      collection.find().toArray(function (_err, docs) {
        query = {
          image_id: uniqid.time(),
          article_id: article_id,
          filename: filename
        }
        collection.insertOne(query, function (_err, inserted) {})
      })
      res.json(
        _displayResults(
          _resultCode.FILE_UPLOAD_SUCCESS,
          'Successfully uploaded',
          true
        )
      )
    } else {
      res
        .status(405)
        .json(
          _displayResults(
            _resultCode.NO_SELECTED_UPLOAD_FILE,
            "Please select file(key='file') to upload"
          )
        )
    }
  }
)

/* get images :  Get */
router.get('/files/images', (req, res) => {
  // var user_id = req.body.user_id;
  // var GalleryName = req.body.GalleryName;
  var collection = db.get().collection(config.imageCollection)
  // var query = { 'user_id': user_id, 'GalleryName': GalleryName };
  collection.find().toArray((err, results) => {
    res.send(results)
  })
})
/* file upload : POST */
// router.post('/files/:filename', upload.single('file'), function (req, res) {
//   if (req.file) {
//     var collection = db.get().collection(config.userCollection);
//     var query = { 'user_id': req.body.user_id };
//     var already = 0;
//     collection.find(query).toArray(function (_err, docs) {
//       var splitImageSource = (docs[0].imagesource).split("#");
//       for (let i = 0; i < splitImageSource.length; i++) {
//         if (splitImageSource[i] == 'uploads/' + req.params.filename) {
//           already = 1;
//         }
//       }
//       if (docs.length !== 0) {
//         if (already == 0) {
//           collection.findOneAndUpdate(
//             { "user_id": req.body.user_id },
//             { "$set": { "imagesource": docs[0].imagesource + 'uploads/' + req.params.filename + '#' } },
//             // { "new": true },
//             function (err, doc) {
//               if (err) { // err: any errors that occurred
//                 console.log(err);
//                 // res.json(_displayResults(err));
//               } else { // doc: the document before updates are applied if `new: false`
//                 console.log(doc); // , the document returned after updates if `new  true`
//                 // res.json(_displayResults(doc.imagesource));
//               }
//             }
//           );
//         }
//       } else {
//         res.status(201).json(_displayResults(_resultCode.USER_NOT_EXIST, 'This user doesnt exist'));
//       }
//     });
//     setTimeout(() => {
//       res.json(_displayResults(_resultCode.FILE_UPLOAD_SUCCESS, 'Successfully uploaded, ' + 'path: ' + 'uploads/' + req.params.filename, true));
//     }, 100);

//   } else {
//     res.status(405).json(_displayResults(_resultCode.NO_SELECTED_UPLOAD_FILE, "Please select file(key='file') to upload"));
//   }
// });

// router.post('/files/delete/:filename', function (req, res) {
//   var collection = db.get().collection(config.userCollection);
//   var query = { 'user_id': req.body.user_id };
//   var already = 0;
//   collection.find(query).toArray(function (_err, docs) {
//     var splitImageSource = (docs[0].imagesource).split("#");
//     for (let i = 0; i < splitImageSource.length; i++) {
//       if (splitImageSource[i] == 'uploads/' + req.params.filename) {
//         already = 1;
//       }
//     }
//     // if (docs.length !== 0) {
//     //   if (already == 0) {
//     //     collection.findOneAndUpdate(
//     //       { "user_id": req.body.user_id },
//     //       { "$set": { "imagesource": docs[0].imagesource + 'uploads/' + req.params.filename + '#' } },
//     //       // { "new": true },
//     //       function (err, doc) {
//     //         if (err) { // err: any errors that occurred
//     //           console.log(err);
//     //           // res.json(_displayResults(err));
//     //         } else { // doc: the document before updates are applied if `new: false`
//     //           console.log(doc); // , the document returned after updates if `new  true`
//     //           // res.json(_displayResults(doc.imagesource));
//     //         }
//     //       }
//     //     );
//     //   }
//     // } else {
//     //   res.status(201).json(_displayResults(_resultCode.USER_NOT_EXIST, 'This user doesnt exist'));
//     // }
//   });
//   setTimeout(() => {
//     res.json(_displayResults(_resultCode.FILE_DELETE_SUCCESS, 'Successfully deleted' + req.params.filename, true));
//   }, 100);
// }
// );

/* file download : GET */
router.get('/files/:filename', function (req, res) {
  var accountId = req.oauth_decoded.pos_client_id
  var filename = req.params.filename
  var file = 'uploads/' + accountId + '/' + filename
  if (!fs.existsSync(file)) {
    return res.json(_displayResults(_resultCode.NO_SUCH_FILE, 'No such file'))
  }
  res.download(file, function (err) {
    console.log('err', err)
    // if (err !== undefined) {
    //   return res.json(_displayResults(_resultCode.NO_SUCH_FILE, err));
    // }
    res.end()
  }) // Set disposition and send it.
})

/* get file list of accountId : GET */
router.get('/files', function (req, res) {
  var accountId = req.oauth_decoded.pos_client_id
  var dir = 'uploads/' + accountId
  var filelist = []
  if (!fs.existsSync(dir)) {
    res.json(_displayResults(_resultCode.FILE_LIST_SUCCESS, filelist))
  } else {
    fs.readdir(dir, (_err, files) => {
      files.forEach(file => {
        filelist.push(file)
      })
      res.json(_displayResults(_resultCode.FILE_LIST_SUCCESS, filelist))
    })
  }
})

/* file upload : POST */
// router.post('/files/:filename', upload.single('file'), function (req, res) {
//   if (req.file) {
//     var collection = db.get().collection(config.userCollection);
//     var query = { 'user_id': req.body.user_id };
//     var already = 0;
//     collection.find(query).toArray(function (_err, docs) {
//       var splitImageSource = (docs[0].imagesource).split("#");
//       for (let i = 0; i < splitImageSource.length; i++) {
//         if (splitImageSource[i] == 'uploads/' + req.params.filename) {
//           already = 1;
//         }
//       }
//       if (docs.length !== 0) {
//         if (already == 0) {
//           collection.findOneAndUpdate(
//             { "user_id": req.body.user_id },
//             { "$set": { "imagesource": docs[0].imagesource + 'uploads/' + req.params.filename + '#' } },
//             // { "new": true },
//             function (err, doc) {
//               if (err) { // err: any errors that occurred
//                 console.log(err);
//                 // res.json(_displayResults(err));
//               } else { // doc: the document before updates are applied if `new: false`
//                 console.log(doc); // , the document returned after updates if `new  true`
//                 // res.json(_displayResults(doc.imagesource));
//               }
//             }
//           );
//         }
//       } else {
//         res.status(201).json(_displayResults(_resultCode.USER_NOT_EXIST, 'This user doesnt exist'));
//       }
//     });
//     setTimeout(() => {
//       res.json(_displayResults(_resultCode.FILE_UPLOAD_SUCCESS, 'Successfully uploaded, ' + 'path: ' + 'uploads/' + req.params.filename, true));
//     }, 100);

//   } else {
//     res.status(405).json(_displayResults(_resultCode.NO_SELECTED_UPLOAD_FILE, "Please select file(key='file') to upload"));
//   }
// });

/* Create article : POST */
var articleId

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads')
    }
    var dir = 'uploads/articles'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    articleId = uniqid.time()
    var dir = 'uploads/articles/' + articleId
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    var filename = req.params.filename
    if (filename === undefined) {
      filename = menufile
    }
    filename = articleId + filename
    cb(null, filename)
  }
})

var maxSize = config.upload_file_max_size
var upload = multer({ storage: storage, limits: { fileSize: maxSize } })

/** ************************ file uplaod and download route *************************/
/* file upload : POST */
router.post('/getdata/addarticle/:filename', upload.single('file'), function (
  req,
  res
) {
  if (req.file) {
    var title = req.body.title
    if (title === undefined) {
      res
        .status(405)
        .json(
          _displayResults(
            _resultCode.TITLE_UNDEFINED,
            'Title(title) is undefined'
          )
        )
      return
    }
    var content = req.body.content
    if (content === undefined) {
      res
        .status(405)
        .json(
          _displayResults(
            _resultCode.CONTENT_UNDEFINED,
            'Content(content) is undefined'
          )
        )
      return
    }
    var status_b = req.body.status_b
    if (status_b === undefined) {
      res
        .status(405)
        .json(
          _displayResults(
            _resultCode.STATUS_UNDEFINED,
            'Status_b(status_b) is undefined'
          )
        )
      return
    }
    var dateTime = req.body.dateTime
    if (dateTime === undefined) {
      res
        .status(405)
        .json(
          _displayResults(
            _resultCode.DATETIME_UNDEFINED,
            'dateTime is undefined'
          )
        )
      return
    }
    var mainImage = req.body.mainImage
    if (mainImage === undefined) {
      res
        .status(405)
        .json(
          _displayResults(
            _resultCode.MAINIMAGE_UNDEFINED,
            'mainImage is undefined'
          )
        )
      return
    }
    mainImage = articleId + mainImage
    var sticky = req.body.sticky
    if (sticky === undefined) {
      res
        .status(405)
        .json(
          _displayResults(_resultCode.STICKY_UNDEFINED, 'sticky is undefined')
        )
      return
    }

    var collection = db.get().collection(config.articleCollection)
    var query = { title: title }
    collection.find(query).toArray(function (_err, docs) {
      if (docs.length === 0) {
        query = {
          article_id: articleId,
          title: title,
          content: content,
          status_b: status_b,
          dateTime: dateTime,
          mainImage: mainImage,
          othersImg: '',
          sticky: sticky
        }
        collection.insertOne(query, function (_err, inserted) {
          res.json(
            _displayResults(
              _resultCode.ARTICLE_CREATED_SUCCESS,
              'Successfully created',
              true
            )
          )
        })
      } else {
        res
          .status(201)
          .json(
            _displayResults(
              _resultCode.ARTICLE_ALREADY_EXIST,
              'This email already exist'
            )
          )
      }
    })
  } else {
    res
      .status(405)
      .json(
        _displayResults(
          _resultCode.NO_SELECTED_UPLOAD_FILE,
          "Please select file(key='file') to upload"
        )
      )
  }
})

/* Edit article : POST */
var article_id_edit
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads')
    }
    var dir = 'uploads/articles'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    article_id_edit = req.body.article_id
    var dir = 'uploads/articles/' + article_id_edit
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    var filename = req.params.filename
    if (filename === undefined) {
      filename = menufile
    }
    filename = article_id_edit + filename
    cb(null, filename)
  }
})

var maxSize = config.upload_file_max_size
var upload = multer({ storage: storage, limits: { fileSize: maxSize } })

/** ************************ file uplaod and download route *************************/
/* file upload : POST */
router.post('/getdata/editarticle/:filename', upload.single('file'), function (
  req,
  res
) {
  var article_id = req.body.article_id
  if (article_id === undefined) {
    res
      .status(405)
      .json(
        _displayResults(_resultCode.TITLE_UNDEFINED, 'article_id is undefined')
      )
    return
  }
  var title = req.body.title
  if (title === undefined) {
    res
      .status(405)
      .json(
        _displayResults(
          _resultCode.TITLE_UNDEFINED,
          'Title(title) is undefined'
        )
      )
    return
  }
  var content = req.body.content
  if (content === undefined) {
    res
      .status(405)
      .json(
        _displayResults(
          _resultCode.CONTENT_UNDEFINED,
          'Content(content) is undefined'
        )
      )
    return
  }
  var status_b = req.body.status_b
  if (status_b === undefined) {
    res
      .status(405)
      .json(
        _displayResults(
          _resultCode.STATUS_UNDEFINED,
          'Status_b(status_b) is undefined'
        )
      )
    return
  }
  var dateTime = req.body.dateTime
  if (dateTime === undefined) {
    res
      .status(405)
      .json(
        _displayResults(_resultCode.DATETIME_UNDEFINED, 'dateTime is undefined')
      )
    return
  }
  var mainImage = req.body.mainImage
  if (mainImage === undefined) {
    res
      .status(405)
      .json(
        _displayResults(
          _resultCode.MAINIMAGE_UNDEFINED,
          'mainImage is undefined'
        )
      )
    return
  }

  var sticky = req.body.sticky
  if (sticky === undefined) {
    res
      .status(405)
      .json(
        _displayResults(_resultCode.STICKY_UNDEFINED, 'sticky is undefined')
      )
    return
  }
  var collection = db.get().collection(config.articleCollection)
  if (req.file !== undefined) {
    //////////////
    mainImage = article_id + mainImage
    ////////////
    var mainImageOld
    var query = { article_id: article_id }
    collection.find(query).toArray(function (_err, docs) {
      mainImageOld = docs[0].mainImage
      var curPath = 'uploads/articles/' + article_id + '/' + mainImageOld
      if (!fs.lstatSync(curPath).isDirectory()) {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
  }
  setTimeout(() => {
    collection.find().toArray(function (_err, docs) {
      collection.findOneAndUpdate(
        { article_id: article_id },
        {
          $set: {
            title: title,
            content: content,
            status_b: status_b,
            dateTime: dateTime,
            mainImage: mainImage,
            othersImg: '',
            sticky: sticky
          }
        },
        function (err, doc) {
          if (err) {
            // err: any errors that occurred
            res.send(err)
          } else {
            res.send(docs)
          }
        }
      )
    })
  }, 1500)
})

/* Get articles: Get */
router.get('/getdata/articles', (req, res) => {
  var collection = db.get().collection(config.articleCollection)
  collection.find().toArray((err, results) => {
    res.send(results)
  })
})

/* Get About us Article: Get */
router.get('/getdata/aboutusDetail', (req, res) => {
  var query = { status_b: '3' }
  var collection = db.get().collection(config.articleCollection)
  collection.find(query).toArray((err, results) => {
    res.send(results[0]);
  })
})

/* Post Set About us: Post */
router.post('/getdata/aboutus', (req, res) => {
  var article_id = req.body.article_id
  var collection = db.get().collection(config.articleCollection)
  collection.find().toArray(function (_err, docs) {
    collection.findOneAndUpdate(
      { article_id: article_id },
      {
        $set: {
          status_b: '3'
        }
      },
      function (err, doc) {
        if (err) {
          res.send(err)
        } else {
          res.send(docs)
        }
      }
    )
  })
})

/* Get articleImages: Get */
router.get('/getdata/articleImages', (req, res) => {
  var collection = db.get().collection(config.articleimagesCollection)
  collection.find().toArray((err, results) => {
    res.send(results)
  })
})

router.post('/getdata/deleteArticle', function (req, res) {
  var article_id = req.body.article_id
  var filename = req.body.filename
  var path = 'uploads/articles/' + '/' + article_id
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      const curPath = Path.join(path, file)
      if (!fs.lstatSync(curPath).isDirectory()) {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }

  // if (!fs.lstatSync(curPath).isDirectory()) { // delete file
  //   fs.unlinkSync(curPath);
  // }
  var collection = db.get().collection(config.articleCollection)
  var query = { article_id: article_id }
  collection.find(query).toArray(function (_err, docs) {
    if (docs.length !== 0) {
      collection.deleteOne(query, function (_err, inserted) {
        collection = db.get().collection(config.articleimagesCollection)
        collection.find(query).toArray(function (_err, docs) {
          if (docs.length !== 0) {
            collection.deleteMany(query, function (_err, inserted) {
              res.json(
                _displayResults(
                  _resultCode.GALLERY_DELETE_SUCCESS,
                  'Successfully deleted',
                  true
                )
              )
            })
          } else {
            res
              .status(201)
              .json(
                _displayResults(
                  _resultCode.GALLERY_ALREADY_DELETED,
                  'This gallery already delete'
                )
              )
          }
        })
      })
    }
  })
})

/* Delete Image */

router.post('/getdata/deleteArticleImage', function (req, res) {
  var article_id = req.body.article_id
  var filename = req.body.filename
  var curPath = 'uploads/articles/' + '/' + article_id + '/' + filename
  if (!fs.lstatSync(curPath).isDirectory()) {
    // delete file
    fs.unlinkSync(curPath)
  }
  var collection = db.get().collection(config.articleimagesCollection)
  var query = { article_id: article_id, filename: filename }
  collection.find(query).toArray(function (_err, docs) {
    if (docs.length !== 0) {
      collection.deleteOne(query, function (_err, inserted) {
        res.json(
          _displayResults(
            _resultCode.GALLERY_DELETE_SUCCESS,
            'Successfully deleted',
            true
          )
        )
      })
    } else {
      res
        .status(201)
        .json(
          _displayResults(
            _resultCode.GALLERY_ALREADY_DELETED,
            'This gallery already delete'
          )
        )
    }
  })
})

/* Set Image */

router.post('/getdata/setImages', function (req, res) {
  var imagesources_id = req.body.imagesources_id
  var imagesources_id_set = req.body.imagesources_id_set
  var user_id = req.body.user_id
  var gallery_id = req.body.gallery_id
  var collection = db.get().collection(config.imageCollection)
  var query = { user_id: user_id, gallery_id: gallery_id }
  collection.find(query).toArray(function (_err, docs) {
    if (docs.length !== 0) {
      for (let i = 0; i < imagesources_id.length; i++) {
        collection.findOneAndUpdate(
          { image_id: imagesources_id[i] },
          {
            $set: {
              imageStatus: imagesources_id_set[i]
            }
          }
        )
      }
      res.send(true)
    } else {
      res
        .status(201)
        .json(
          _displayResults(
            _resultCode.GALLERY_ALREADY_DELETED,
            'This gallery already delete'
          )
        )
    }
  })
})

/** ************************ menu route *************************/
/* menu.json file upload : POST */
router.post('/menu', function (req, res) {
  var menu = req.body
  if (isEmpty(menu)) {
    res
      .status(405)
      .json(
        _displayResults(_resultCode.NO_SELECTED_UPLOAD_FILE, 'Invalid input')
      )
    return
  }
  var accountId = req.oauth_decoded.pos_client_id
  var fileDir = 'uploads/' + accountId + '/' + menufile
  fs.writeFile(fileDir, JSON.stringify(menu), function (_err) {
    if (_err) {
      console.log('An error occured while writing JSON Object to File.')
      res.status(201).json(_displayResults(_resultCode.ERROR_IN_FILE, _err))
      return
    }
    res.json(
      _displayResults(
        _resultCode.FILE_UPLOAD_SUCCESS,
        'Successfully saved',
        true
      )
    )
  })
})

/* menu.json file download : GET */
router.get('/menu', function (req, res) {
  var accountId = req.oauth_decoded.pos_client_id
  var filename = menufile
  var file = 'uploads/' + accountId + '/' + filename
  console.log('file', file)
  if (!fs.existsSync(file)) {
    return res.json(_displayResults(_resultCode.NO_SUCH_FILE, 'No such file'))
  }
  res.download(file, function (err) {
    console.log('err', err)
    // if (err !== undefined) {
    //   return res.json(_displayResults(_resultCode.NO_SUCH_FILE, err));
    // }
    res.end()
  }) // Set disposition and send it.
})

// check if obj is empty or not
function isEmpty (obj) {
  if (typeof obj === 'string') {
    return false
  }
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false
    }
  }
  return true
}

module.exports = router
