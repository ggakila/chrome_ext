const multer = require('multer');

// Configure multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       const destinationPath = '/home/eriq/projects/chrome_ext/server/uploads';
//       cb(null, destinationPath); // Uploads will be stored in the 'uploads' directory
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + '-' + file.originalname);
//     },
//   });
const storage = multer.memoryStorage(); 

 
const upload = multer({ storage: storage });

module.exports = upload;