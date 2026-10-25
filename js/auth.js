/**
 * EVETRAMASY — Authentication Layer
 * Handles login, registration, sessions, forgot-password.
 */

const Auth = (() => {
  const SESSION_KEY = 'evetramasy_session';

  function _getBasePath() {
    const p = window.location.pathname;
    if (p.includes('/customer/') || p.includes('/organiser/') || p.includes('/parking-owner/')) {
      return '../';
    }
    return './';
  }

  function _saveSession(user) {
    const safe = { id: user.id, username: user.username, name: user.name, role: user.role, email: user.email };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    return safe;
  }

  return {
    // ── Get current logged-in user ──────────────────────────────────────────
    current() {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    },

    isLoggedIn() { return !!this.current(); },

    // ── Login ───────────────────────────────────────────────────────────────
    login(username, password) {
      const user = DB.Users.findByUsername(username.trim().toLowerCase());
      if (!user)              return { error: 'User not found. Please check your username.' };
      if (user.password !== password) return { error: 'Incorrect password.' };
      return { user: _saveSession(user) };
    },

    // ── Register ────────────────────────────────────────────────────────────
    register({ username, email, password, confirmPassword, name, phone, role }) {
      if (!username || !email || !password || !name || !role)
        return { error: 'All fields are required.' };
      if (password !== confirmPassword)
        return { error: 'Passwords do not match.' };
      if (password.length < 6)
        return { error: 'Password must be at least 6 characters.' };
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(email))
        return { error: 'Invalid email address.' };

      const result = DB.Users.create({
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password, name, phone: phone || '', role
      });
      if (result.error) return result;

      // Welcome notification
      DB.Notifications.push(result.user.id, `Welcome to EVETRAMASY, ${name}! 🎉`, 'info');
      return { user: _saveSession(result.user) };
    },

    // ── Logout ──────────────────────────────────────────────────────────────
    logout() {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = _getBasePath() + 'index.html';
    },

    // ── Forgot Password (simulated — returns hint) ──────────────────────────
    forgotPassword(username) {
      const user = DB.Users.findByUsername(username.trim().toLowerCase());
      if (!user) return { error: 'No account found with that username.' };
      // In a real app this sends an email. Here we reveal the password as a hint.
      return { hint: `Your password hint: ${user.password.charAt(0)}${'*'.repeat(user.password.length - 2)}${user.password.slice(-1)}` };
    },

    // ── Reset Password ──────────────────────────────────────────────────────
    resetPassword(username, newPassword) {
      if (newPassword.length < 6) return { error: 'Password must be at least 6 characters.' };
      const ok = DB.Users.resetPassword(username.trim().toLowerCase(), newPassword);
      if (!ok) return { error: 'User not found.' };
      return { success: true };
    },

    // ── Route guard — redirect if not logged in ─────────────────────────────
    requireAuth(allowedRole) {
      const user = this.current();
      const base = _getBasePath();
      if (!user) { window.location.href = base + 'index.html'; return null; }
      if (allowedRole && user.role !== allowedRole) {
        alert('Access denied. You do not have permission to view this page.');
        this.redirectByRole(user.role);
        return null;
      }
      return user;
    },

    // ── Redirect to correct dashboard after login ───────────────────────────
    redirectByRole(role) {
      const base = _getBasePath();
      const map = {
        customer:       base === '../' ? '../customer/dashboard.html' : 'customer/dashboard.html',
        organiser:      base === '../' ? '../organiser/dashboard.html' : 'organiser/dashboard.html',
        parking_owner:  base === '../' ? '../parking-owner/dashboard.html' : 'parking-owner/dashboard.html',
      };
      window.location.href = map[role] || (base + 'index.html');
    }
  };
})();
