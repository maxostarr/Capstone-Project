
import axios from 'axios';
let accessToken = window.localStorage.getItem('accessToken');

export let emailClient = axios.create({
  baseURL: 'http://localhost:3010/v0/',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

export const loadToken = () => {
  accessToken = window.localStorage.getItem('accessToken');
  emailClient = axios.create({
    baseURL: 'http://localhost:3010/v0/',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
};
