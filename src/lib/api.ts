import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "", // fallback to relative path
  withCredentials: true, // send http-only cookies
});



// optional: attach interceptors for error handling or auth refresh

// if a 401/403 comes back we might want to force logout by
// updating the auth context (context consumers can react accordingly).
// we can't directly import useAuth here, but consumers can catch errors
// or you could dispatch a global event. For simplicity we leave this
// as a placeholder.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // create a custom event so other parts of the app can respond
      window.dispatchEvent(new Event('unauthorized')); 
    }
    return Promise.reject(error);
  }
);

export default api;
