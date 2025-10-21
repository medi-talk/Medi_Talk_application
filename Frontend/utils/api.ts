import axios from 'axios';
import { Platform } from 'react-native';
import { BACKEND_APP_CONFIG } from "../config/apiConfig";

const SERVER_BASE = BACKEND_APP_CONFIG.BASE_URL;

// 환경 스위치
const USE_REMOTE_SERVER = false; // true → 서버로, false → 로컬(adb reverse)

const getBaseURL = () => {
   if (!USE_REMOTE_SERVER) {
    // 개발용
    return Platform.OS === 'android'
      ? 'http://localhost:3000'   // USB + adb reverse
      : 'http://localhost:3000';
    // 에뮬레이터라면 'http://10.0.2.2:3000'
   } else {
    // 서버용
    return SERVER_BASE;
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export default api;
