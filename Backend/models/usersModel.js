/* ========== 사용자 ========== */

const pool = require('../db/connection').promise();


// 회원가입
async function createUser(u) {
	const sql = `
	INSERT INTO users(user_id, user_password, user_name, phone_number, birthday, sex, pregnant_flag, feeding_flag)
	VALUES(?, ?, ?, ?, ?, ?, ?, ?)
	`;
	const params = [
	u.email, u.password, u.name, u.phonenumber,
	u.birth, u.gender == '남자' ? 'M' : 'F', 
	u.pregnant ? 1 : 0, u.feeding ? 1 : 0,
	];
	const [r] = await pool.execute(sql, params);
	return r.affectedRows;
}


module.exports = {
  createUser
};