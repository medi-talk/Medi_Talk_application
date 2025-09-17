import axios from 'axios';
import { Platform } from 'react-native';

const getBaseURL = () => {
  return Platform.OS === 'android'
    ? 'http://localhost:3000'   // USB + adb reverse
    : 'http://localhost:3000';
  // 에뮬레이터라면 'http://10.0.2.2:3000'
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export default api;
