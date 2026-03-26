// ===== MODERN NOTIFICATION FUNCTION (Toast) =====
function showNotification(message, type = 'success') {
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

    // Animate in
    requestAnimationFrame(() => { notification.classList.remove('opacity-0', 'translate-x-full'); });

    // Animate out and remove after a delay
    setTimeout(() => {
        notification.classList.add('opacity-0', 'translate-x-full');
        notification.addEventListener('transitionend', () => notification.remove());
    }, 2000); 
}

// ===== FORM =====
const form = document.getElementById('form1');

// ===== INPUTOK =====
const emailInput = document.getElementById('Email');
const usernameInput = document.getElementById('felhaszNev');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('passwordConfirm');

// ===== TOGGLE ELEMEK =====
const togglePassword = document.getElementById('togglePassword');
const togglePasswordConfirm = document.getElementById('togglePasswordConfirm');

const passwordIcon = togglePassword.querySelector('img');
const passwordConfirmIcon = togglePasswordConfirm.querySelector('img');

// ===== IKONOK =====
const eyeOpen = "images/icons/szem icon.svg";
const eyeClosed = "images/icons/szem csukott.svg";

// ===== FELHASZNÁLÓK BETÖLTÉSE (FONTOS) =====
const users = JSON.parse(localStorage.getItem('users')) || [];

// ===== JELSZÓ MUTATÁS =====
togglePassword.addEventListener('click', () => {
    const hidden = passwordInput.type === 'password';
    passwordInput.type = hidden ? 'text' : 'password';
    passwordIcon.src = hidden ? eyeClosed : eyeOpen;
});

togglePasswordConfirm.addEventListener('click', () => {
    const hidden = passwordConfirmInput.type === 'password';
    passwordConfirmInput.type = hidden ? 'text' : 'password';
    passwordConfirmIcon.src = hidden ? eyeClosed : eyeOpen;
});

// ===== REGISZTRÁCIÓ =====
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;

    // Alap ellenőrzések
    if (!email || !username || !password || !passwordConfirm) {
        showNotification('Minden mező kitöltése kötelező!', 'error');
        return;
    }

    if (password !== passwordConfirm) {
        showNotification('A jelszavak nem egyeznek!', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('A jelszónak legalább 6 karakteresnek kell lennie!', 'error');
        return;
    }

    // DUPLIKÁCIÓ ELLENŐRZÉS
    if (users.some(u => u.email === email)) {
        showNotification('Ez az email már regisztrálva van!', 'error');
        return;
    }

    if (users.some(u => u.username === username)) {
        showNotification('Ez a felhasználónév már foglalt!', 'error');
        return;
    }

    // ÚJ FELHASZNÁLÓ
    const newUser = {
        email,
        username,
        password
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedUser', JSON.stringify(newUser));

    console.log('Regisztrált userek:', users);
    showNotification('Sikeres regisztráció! Átirányítunk a főoldalra...', 'success');
    

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
});
