const menuOpen = document.getElementById('menuOpen');
const menuClose = document.getElementById('menuClose');
const menu = document.getElementById('myLinks');

menuOpen?.addEventListener('click', () => {
  menu.classList.add('active');
  menuOpen.hidden = true;
});

menuClose?.addEventListener('click', () => {
  menu.classList.remove('active');
  menuOpen.hidden = false;
});

const registerLink = document.getElementById('registerLink');
const loginLink = document.getElementById('loginLink');
const logoutLink = document.getElementById('logoutLink');

if (localStorage.getItem('loggedUser')) {
  if (registerLink) registerLink.style.display = 'none';
  if (loginLink) loginLink.style.display = 'none';
  if (logoutLink) logoutLink.style.display = 'block';
}

logoutLink?.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('loggedUser');
  alert('Sikeresen kijelentkeztél!');
  window.location.reload();
});