const { mongoose } = require("mongoose");
const fs = require("fs");
const path = require("path");

const {
    OK,
    INTERNAL_SERVER_ERROR,
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND,
} = require("../constants/statusCode");
const { successMessage, errorMessage } = require("../utils/app-errors");
const { createFolderIfNotExists, moveFileToFolder } = require("../utils");

class FileControllers {
    async fileUpload(req, res) {
        if (req.error) {
            return res.status(BAD_REQUEST).send(errorMessage(req.error));
        }

        const fileTypeToFolder = {
            ".jpg": "images",
            ".jpeg": "images",
            ".png": "images",
            ".gif": "images",
            ".txt": "docs",
            ".pdf": "pdfs",
        };

        const extension = req.file_extension;
        const folderName = fileTypeToFolder[extension] || "other";

        // req.body.path = "uploads/images/habiabi"
        // my root folder is "./uploads"
        //i waana upload the file as "uploads/images/habiabi/folderName/file"
        //but i am getting error while moving the file

        let targetDirectory = req.body.path || folderName;

        if (targetDirectory === "./uploads") {
            targetDirectory = folderName;
        } else if (targetDirectory.split("/").length > 1) {
            const parts = targetDirectory.split("/");
            parts.shift();
            targetDirectory = path.join(parts.join("/"), folderName);
        }


        const folderPath = path.join("./uploads", targetDirectory);


        console.log("targetDirectory:", targetDirectory.split("/"), targetDirectory.split("/").length, folderPath);

        try {
            await createFolderIfNotExists(folderPath);
            const fileNameWithoutExtension = path.parse(req.file.filename).name;
            const destinationPath = path.join(folderPath, fileNameWithoutExtension + extension);

            await moveFileToFolder(req.file, destinationPath);
            const filesInDirectory = fs.readdirSync(folderPath);

            res.status(OK).json({ message: "File uploaded and sorted", files: filesInDirectory });
        } catch (error) {
            res.status(BAD_REQUEST).send(errorMessage("Error moving file to folder"));
        }
    }



    async getAllFiles(req, res) {
        // console.log(req.body);
        try {
            // const directoryPath = "./uploads";
            let currentPath = req.body.current_path_folder
            if (req.body.target_folder) {
                currentPath = path.join(currentPath, req.body.target_folder);
            }
            const contents = fs.readdirSync(currentPath);

            const files = [];
            const folders = [];

            contents.forEach((item) => {
                const itemPath = path.join(currentPath, item);
                const stats = fs.statSync(itemPath);

                if (stats.isFile()) {
                    files.push(item);
                } else if (stats.isDirectory()) {
                    folders.push(item);
                }
            });

            res.status(200).json({ files, folders, current_path: currentPath.replace(/\\/g, '/') });
        } catch (error) {
            res.status(500).send(errorMessage("Error retrieving files"));
        }
    }

    // Download file from file name
    async downloadFile(req, res) {
        const filename = req.params.fileName;
        console.log(filename);
        try {
            const filePath = `./uploads/${filename}`;
            res.download(filePath);
            // res.status(OK).sendFile(filePath);
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).send(errorMessage("Error downloading file"));
        }
    }

    async getFileLink(req, res) {
        const filename = req.params.fileName;
        try {
            // const filePath = `./uploads/${filename}`;
            const serverPath = `http://localhost:8000/uploads/${filename}`;
            res.status(OK).json({ link: serverPath });
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).send(errorMessage("Error getting file link"));
        }
    }

    async deleteOneFile(req, res) {
        const filename = req.params.fileName;
        console.log(filename);
        try {
            fs.unlinkSync(`./uploads/${filename}`);
            res.status(OK).send(successMessage("File deleted"));
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).send(errorMessage("Error deleting file"));
        }
    }

    async deleteFiles(req, res) {
        try {
            const files = fs.readdirSync("./uploads");
            for (const file of files) {
                fs.unlinkSync(`./uploads/${file}`);
            }
            res.status(OK).send(successMessage("Files deleted"));
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).send(errorMessage("Error deleting files"));
        }
    }
}




module.exports = new FileControllers();
