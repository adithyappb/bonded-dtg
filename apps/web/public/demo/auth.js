// Application Authentication Layer
class Auth {
  static login(username, password) {
    // Hardcoded realistic demo credentials verification
    if (username === 'demo@bonded.app' && password === 'Hackathon2026!') {
      sessionStorage.setItem('auth_token', 'bonded_demo_token_xyz');
      window.location.href = 'index.html';
      return true;
    }
    return false;
  }

  static check() {
    const isAuth = sessionStorage.getItem('auth_token') !== null;
    const isLoginPage = window.location.pathname.endsWith('login.html');

    // Protect routes
    if (!isAuth && !isLoginPage) {
      window.location.href = 'login.html';
    } 
    // Redirect away from login if already authenticated
    else if (isAuth && isLoginPage) {
      window.location.href = 'index.html';
    }
  }

  static logout() {
    sessionStorage.removeItem('auth_token');
    window.location.href = 'login.html';
  }
}

// Run auth check immediately on script load
Auth.check();
