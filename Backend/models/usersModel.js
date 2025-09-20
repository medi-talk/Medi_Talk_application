/* ========== 사용자 ========== */

const pool = require('../db/connection').promise();


// 회원가입
async function createUser(u) {
	const sql = `
		INSERT INTO users(user_id, user_password, user_name, phone_number, birthday, gender, pregnant_flag, feeding_flag)
		VALUES(?, ?, ?, ?, ?, ?, ?, ?)
	`;
	const params = [
	u.email, u.password, u.name, u.phonenumber,
	u.birth, u.gender, 
	u.pregnant ? 1 : 0, u.feeding ? 1 : 0,
	];
	const [r] = await pool.execute(sql, params);
	return r.affectedRows;
};

// 로그인
async function getUser(userId, userPassword) {
	const sql = `
		SELECT user_id, user_name
		FROM users
		WHERE user_id = ? AND user_password = ?
	`;
	const [rows] = await pool.execute(sql, [userId, userPassword]);
	return rows[0] ?? null;
};

// 사용자 정보 조회
async function getUserInfo(userId) {
	const sql = `
		SELECT user_name, phone_number, birthday, gender, pregnant_flag, feeding_flag
		FROM users
		WHERE user_id = ?
	`;
	const [rows] = await pool.execute(sql, [userId]);
	return rows[0] ?? null;
};

// 사용자 정보 수정
async function updateUserInfo(userId, u) {
	const sql = `
		UPDATE users
		SET user_name = ?, phone_number = ?, birthday = ?, gender = ?, pregnant_flag = ?, feeding_flag = ?
		WHERE user_id = ?
	`;
	const params = [
		u.user_name, u.phone_number, u.birthday, u.gender,
		u.pregnant_flag ? 1 : 0, u.feeding_flag ? 1 : 0,
		userId
	];
	const [r] = await pool.execute(sql, params);
	return r.affectedRows;
};

// 사용자 패스워드 조회
async function getUserPassword(userId) {
	const sql = `
		SELECT user_password
		FROM users
		WHERE user_id = ?
	`;
	const [rows] = await pool.execute(sql, [userId]);
	return rows[0] ?? null;
};

// 사용자 패스워드 변경
async function updateUserPassword(userId, newPassword) {
	const sql = `
		UPDATE users
		SET user_password = ?
		WHERE user_id = ?
	`;
	const [r] = await pool.execute(sql, [newPassword, userId]);
	return r.affectedRows;
};

module.exports = {
  createUser,
	getUser,
	getUserInfo,
	updateUserInfo,
	getUserPassword,
	updateUserPassword
};