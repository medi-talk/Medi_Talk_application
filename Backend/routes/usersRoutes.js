/* ========== 사용자 ========== */

const express = require('express');
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  changeUserPassword
} = require('../controllers/usersController');


router.post('/registerUser', registerUser);
router.post('/loginUser', loginUser);
router.get('/getUserProfile/:userId', getUserProfile);
router.put('/updateUserProfile/:userId', updateUserProfile);
router.put('/changeUserPassword/:userId', changeUserPassword);

module.exports = router;