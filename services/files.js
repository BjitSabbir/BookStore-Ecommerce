const multer = require("multer");
const fileTypes = [".jpg", ".jpeg", ".png", ".PNG", ".gif", ".txt", ".pdf"];
const path = require("path");

const upload = multer({
    limits: {
        fileSize: 1024 * 1024 * 100, // 100MB
    },
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            if (file) {
                callback(null, "./uploads");
            } else {
                req.error = "File not found";
                callback(req.error, null);
            }
        },
        filename: (req, file, callback) => {
            if (file) {
                const originalname = file.originalname;
                const fileName = Date.now() + "_" + originalname.replace(/ /g, "_");
                req.fileName = fileName;
                callback(null, fileName);
            } else {
                req.error = "File not found";
                callback(req.error, null);
            }
        },
    }),
    fileFilter: (req, file, callback) => {
        if (file) {
            const extension = path.extname(file.originalname);
            req.file_extension = extension;
            req.file = file;
            if (fileTypes.includes(extension)) {
                callback(null, true);
            } else {
                req.error = "File type not allowed";
                callback(req.error, false);
            }
        }
    },
});

module.exports = upload;
