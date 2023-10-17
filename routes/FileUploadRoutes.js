const express = require("express");
const upload = require("../services/files");
const { fileUpload, getAllFiles, downloadFile, getFileLink, deleteOneFile } = require("../controllers/FileControllers");
const route = express.Router();

route.post("/upload", upload.single("file_to_upload"), fileUpload)
route.post("/uploaded", getAllFiles)
route.get("/download/:fileName", downloadFile)
route.get("/getLink/:fileName", getFileLink)
route.delete("/remove/:fileName", deleteOneFile)


module.exports = route;