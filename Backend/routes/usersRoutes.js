/* ========== 사용자 ========== */

const express = require('express');
const router = express.Router();

const { registerUser } = require('../controllers/usersController');


router.post('/registerUser', registerUser);


module.exports = router;