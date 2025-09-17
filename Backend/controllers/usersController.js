/* ========== 사용자 ========== */

const {
  createUser
} = require('../models/usersModel');


// 회원가입
const registerUser = async (req, res) => {
  try {
    const result = await createUser(req.body);
    if (result > 0) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: '회원가입 실패' });
    }
  } catch (err) {
    console.error('❌ register error:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};


module.exports = {
  registerUser
};