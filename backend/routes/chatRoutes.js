const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/assistant', auth, chatController.chatAssistant);
router.post('/transcribe', auth, upload.single('audio'), chatController.transcribeAudio);

module.exports = router;
