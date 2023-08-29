const multer = require('multer');
const path = require('path');
const Pet = require('../../server/models/pets');


//This is multer configuration. It is used to temporarily store files in the uploads folder.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.join(__dirname, '..', '..', 'MulterUploads');
      cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname;
        const extension = originalName.substring(originalName.lastIndexOf('.'));
        const uniquePrefix = Date.now() + '-';
        cb(null, uniquePrefix + originalName);
    }
});
//Instance of multer
const upload = multer({ storage: storage });



module.exports =  { upload };