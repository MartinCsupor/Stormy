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

// ===== MODERN NOTIFICATION FUNCTION (Toast) =====

if (typeof showNotification === 'undefined') {
    window.showNotification = function(message, type = 'success') {
        const notification = document.createElement('div');
        notification.textContent = message;

       
        notification.className = 'fixed top-20 right-5 p-4 rounded-lg text-white font-bold shadow-xl transform transition-all duration-500 ease-in-out z-[2000] opacity-0 translate-x-full';

        if (type === 'error') {
            notification.classList.add('bg-red-600');
        } else if (type === 'info') {
            notification.classList.add('bg-blue-500');
        } else { // 'success'
            notification.classList.add('bg-green-500');
        }

        document.body.appendChild(notification);
        requestAnimationFrame(() => { notification.classList.remove('opacity-0', 'translate-x-full'); });

        setTimeout(() => {
            notification.classList.add('opacity-0', 'translate-x-full');
            notification.addEventListener('transitionend', () => notification.remove());
        }, 2000);
    };
}

logoutLink?.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('loggedUser');
  showNotification('Sikeresen kijelentkeztél!', 'success');
  setTimeout(() => { window.location.reload(); }, 1000);
});