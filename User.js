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
        alert('Minden mező kitöltése kötelező!');
        return;
    }

    if (password !== passwordConfirm) {
        alert('A jelszavak nem egyeznek!');
        return;
    }

    if (password.length < 6) {
        alert('A jelszónak legalább 6 karakteresnek kell lennie!');
        return;
    }

    // DUPLIKÁCIÓ ELLENŐRZÉS
    if (users.some(u => u.email === email)) {
        alert('Ez az email már regisztrálva van!');
        return;
    }

    if (users.some(u => u.username === username)) {
        alert('Ez a felhasználónév már foglalt!');
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

    console.log('Regisztrált userek:', users);
    alert('Sikeres regisztráció! 🎉');

    form.reset();
});
