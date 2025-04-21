import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: (process.env.API_URL as string) || 'http://localhost:3000/api',
    timeout: 1000,
    headers: { 'X-Custom-Header': 'foobar' },
});

export default axiosInstance;
