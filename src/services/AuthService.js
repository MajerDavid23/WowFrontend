import api from "./api";

export default {
  register(email, password) {
    return api.post("/auth/register", { email, password });
  },

  login(email, password) {
    return api.post("/auth/login", { email, password });
  },

  forgotPassword(email) {
    return api.post("/auth/forgot-password", { email });
  },

  resetPassword(token, newPassword) {
  return api.post(`/auth/reset?token=${token}&newPassword=${newPassword}`);
}

};
