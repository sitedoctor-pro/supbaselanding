const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

async function redirectIfLoggedIn() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (!error && data.session) {
    window.location.href = 'dashboard.html';
  }
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideMessage(loginMessage);

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showMessage(loginMessage, error.message, 'error');
    return;
  }

  showMessage(loginMessage, 'Login successful. Redirecting...', 'success');
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 700);
});

redirectIfLoggedIn();
