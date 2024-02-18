// upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const expressJoi = require('@escook/express-joi')
const { upload_schema } = require('../schema/user')


const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join('./home/file', getCurrentDateByExtension(file.originalname));
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = new Date().getTime();
        const extname = path.extname(file.originalname);
        cb(null, `${timestamp}${extname}`);
    },
});

const upload = multer({
    storage, limits: {
        fileSize: 10 * 1024 * 1024 
    }
});

function getCurrentDateByExtension(filename) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const extname = path.extname(filename).replace('.', '');
    return `${year}/${month}/${day}/${hour}/${extname}`;
}

router.post('/data', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.cc('上传文件失败');
        }

        const filePath = req.file.path;
        const publicURL = filePath.replace(/^home\/file/, '');
        console.log('文件上传成功，URL:', publicURL);
        res.send({ code: 200, message: '文件上传成功', url: publicURL });
    } catch (error) {
        console.log(error,"456456");
        console.error('文件上传过程错误:', error);
        return res.cc('文件上传失败，请稍后重试');
    }
});


module.exports = router;
