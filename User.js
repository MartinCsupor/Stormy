// ===== EMAILJS INICIALIZÁLÁSA =====
if (typeof emailjs !== 'undefined') {
    emailjs.init("CTia56tBnS9UP94Qm");
}

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
const registrationForm = document.getElementById('form1');
const forgotPasswordForm = document.getElementById('forgotPassForm');

// ===== FELHASZNÁLÓK BETÖLTÉSE =====
const users = JSON.parse(localStorage.getItem('users')) || [];

// ===== REGISZTRÁCIÓS LOGIKA =====
if (registrationForm) {
    const emailInput = document.getElementById('Email');
    const usernameInput = document.getElementById('felhaszNev');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const togglePassword = document.getElementById('togglePassword');
    const togglePasswordConfirm = document.getElementById('togglePasswordConfirm');
    const passwordIcon = togglePassword.querySelector('img');
    const passwordConfirmIcon = togglePasswordConfirm.querySelector('img');
    const eyeOpen = "images/icons/szem icon.svg";
    const eyeClosed = "images/icons/szem csukott.svg";

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

    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;

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
        if (users.some(u => u.email === email)) {
            showNotification('Ez az email már regisztrálva van!', 'error');
            return;
        }
        if (users.some(u => u.username === username)) {
            showNotification('Ez a felhasználónév már foglalt!', 'error');
            return;
        }

        const newUser = { email, username, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('loggedUser', JSON.stringify(newUser));
        showNotification('Sikeres regisztráció! Átirányítunk...', 'success');
        setTimeout(() => { window.location.href = "index.html"; }, 1000);
    });
}

// ===== ELFELEJTETT JELSZÓ LOGIKA =====
if (forgotPasswordForm) {
    const emailStep = document.getElementById('emailStep');
    const passwordStep = document.getElementById('passwordStep');
    const checkEmailBtn = document.getElementById('checkEmailBtn');
    const forgotEmailInput = document.getElementById('forgotEmail');
    const newPassInput = document.getElementById('newPassword');
    const newPassConfirmInput = document.getElementById('newPasswordConfirm');
    const codeStep = document.getElementById('codeStep');
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    const verificationCodeInput = document.getElementById('verificationCode');
    let generatedCode = "";

    // Szem ikonok kezelése az új jelszó megadásakor 
    const toggleNewPass = document.getElementById('toggleNewPassword');
    const toggleNewPassConfirm = document.getElementById('toggleNewPasswordConfirm');
    const eyeOpen = "images/icons/szem icon.svg";
    const eyeClosed = "images/icons/szem csukott.svg";

    if (toggleNewPass) {
        toggleNewPass.addEventListener('click', () => {
            const isPassword = newPassInput.type === 'password';
            newPassInput.type = isPassword ? 'text' : 'password';
            toggleNewPass.src = isPassword ? eyeClosed : eyeOpen;
        });
    }

    if (toggleNewPassConfirm) {
        toggleNewPassConfirm.addEventListener('click', () => {
            const isPassword = newPassConfirmInput.type === 'password';
            newPassConfirmInput.type = isPassword ? 'text' : 'password';
            toggleNewPassConfirm.src = isPassword ? eyeClosed : eyeOpen;
        });
    }

    let targetUserEmail = "";

    checkEmailBtn.addEventListener('click', () => {
        const email = forgotEmailInput.value.trim();
        const user = users.find(u => u.email === email);
        if (user) {
            if (!email) {
                showNotification('Hiba: Az e-mail cím üres!', 'error');
                return;
            }

            targetUserEmail = email;
            
            generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
            
            console.log(`Küldés folyamatban ide: ${email}, kód: ${generatedCode}`);
            
            const templateParams = {
                to_email: email, 
                verification_code: generatedCode
            };

            emailjs.send('service_16pgfoo', 'template_d3xiyce', templateParams)
                .then(() => {
                    console.log('E-mail sikeresen elküldve!');
                    showNotification('Ellenőrző kód elküldve az e-mail címedre!', 'success');
                })
                .catch((error) => {
                    console.error('EmailJS hiba:', error.status, error.text);
                    if (error.status === 422) {
                        showNotification('Hiba: Az EmailJS sablonban nincs beállítva a címzett! (To Email: {{to_email}})', 'error');
                    } else {
                        showNotification('Hiba történt az e-mail küldésekor. Próbáld később!', 'error');
                    }
                });

            emailStep.classList.add('hidden');
            codeStep.classList.remove('hidden');
        } else {
            showNotification('Ez az email cím nincs regisztrálva!', 'error');
        }
    });

    verifyCodeBtn.addEventListener('click', () => {
        const enteredCode = verificationCodeInput.value.trim();
        if (enteredCode === generatedCode) {
            codeStep.classList.add('hidden');
            passwordStep.classList.remove('hidden');
            showNotification('Kód elfogadva! Most megadhatod az új jelszavad.', 'success');
        } else {
            showNotification('Helytelen ellenőrző kód!', 'error');
        }
    });

    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPass = newPassInput.value;
        const confirmPass = newPassConfirmInput.value;
        if (newPass.length < 6) {
            showNotification('A jelszónak legalább 6 karakteresnek kell lennie!', 'error');
            return;
        }
        if (newPass !== confirmPass) {
            showNotification('A jelszavak nem egyeznek!', 'error');
            return;
        }
        const userIndex = users.findIndex(u => u.email === targetUserEmail);
        if (userIndex !== -1) {
            users[userIndex].password = newPass;
            localStorage.setItem('users', JSON.stringify(users));
            showNotification('Sikeres jelszómódosítás! Átirányítás...', 'success');
            setTimeout(() => { window.location.href = "login.html"; }, 1500);
        }
    });
}
