/* ========== 사용자 ========== */

const {
  createUser,
  getUser,
  getUserInfo,
  updateUserInfo,
  getUserPassword,
  updateUserPassword
} = require('../models/usersModel');


// 회원가입
const registerUser = async (req, res) => {
  try {
    const result = await createUser(req.body);

    // 회원가입 성공
    if (result > 0) {
      return res.json({ success: true });
    }
    
    // 회원가입 실패
    return res.status(400).json({ 
      success: false, 
      message: '회원가입 실패 ❌' 
    });

  } catch (err) {
    console.error('❌ register error:', err);

    // 회원가입 실패 (중복된 아이디)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: '이미 가입된 아이디입니다.'
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 로그인
const loginUser = async (req, res) => {
  try {
    const { userId, userPassword } = req.body;
    const user = await getUser(userId, userPassword);

    // 로그인 실패
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // 로그인 성공
    return res.json({
      success: true,
      user: {
        userId: user.user_id,
        userName: user.user_name
      },
    });

  } catch (err) {
    console.error('❌ login error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 정보 조회
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userInfo = await getUserInfo(userId);

    return res.json({ 
      success: true, 
      profile : {
        user_name: userInfo.user_name,
        phone_number: userInfo.phone_number,
        birthday: userInfo.birthday,
        gender: userInfo.gender,
        pregnant_flag: !!userInfo.pregnant_flag,
        feeding_flag: !!userInfo.feeding_flag
      } });

  } catch (err) {
    console.error('❌ getUserProfile error:', err);

    return res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
};

// 사용자 정보 수정
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    let { user_name, phone_number, birthday, gender, pregnant_flag, feeding_flag } = req.body;

    const payload = {
      user_name,
      phone_number,
      birthday,
      gender,
      pregnant_flag: !!pregnant_flag,
      feeding_flag: !!feeding_flag
    };

    const result = await updateUserInfo(userId, payload);
    
    // 수정 성공
    if (result > 0) {
      return res.json({ success: true });
    }

    // 수정 실패
    return res.status(400).json({
      success: false,
      message: '사용자 정보 수정에 실패했습니다. ❌'
    });

  } catch (err) {
    console.error('❌ updateUserProfile error:', err);

    return res.status(500).json({
      success: false,
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 사용자 패스워드 변경
const changeUserPassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { currentPassword, newPassword } = req.body;

    const rows = await getUserPassword(userId);
    const userPassword = rows?.user_password;

    // 현재 패스워드 불일치
    if (userPassword !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.'
      });
    }

    // 패스워드 변경
    const result = await updateUserPassword(userId, newPassword);

    // 변경 성공
    if (result > 0) {
      return res.json({ success: true });
    }

    // 변경 실패
    return res.status(400).json({
      success: false,
      message: '비밀번호 변경에 실패했습니다. ❌'
    });

  } catch (err) {
    console.error('❌ changeUserPassword error:', err);

    return res.status(500).json({
      success: false,
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword
};