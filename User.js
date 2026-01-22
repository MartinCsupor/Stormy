const form = document.getElementById('form');
const FelhaszEmail = document.getElementById('Email');
const felhaszN = document.getElementById('felhaszNev');
const FelhaszJel = document.getElementById('jelszo');
const JelHit = document.getElementById('jelszoHit');

// Array to store user data
const users = [];

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = FelhaszEmail.value;
    const username = felhaszN.value;
    const password = FelhaszJel.value;
    const password_confirmation = JelHit.value;

    let errors = getSignUpErrors(email, username, password, password_confirmation);

    if (errors.length > 0) {
        // Display errors (you can customize this part to show errors in the UI)
        console.log(errors);
    } else {
        // If no errors, store user data in the array
        const newUser = {
            email: email,
            username: username,
            password: password,
        };
        users.push(newUser);

        // Clear form fields
        FelhaszEmail.value = '';
        felhaszN.value = '';
        FelhaszJel.value = '';
        JelHit.value = '';

        console.log('User registered successfully:', newUser);
        console.log('All users:', users);
    }
});

function getSignUpErrors(email, username, password, password_confirmation) {
    let errors = [];
    if (email === '' || email == null) {
        errors.push('Az email mező nem lehet üres.');
        FelhaszEmail.parentElement.classList.add('Nem jó');
    }
    if (username === '' || username == null) {
        errors.push('A felhasználó mező nem lehet üres.');
        felhaszN.parentElement.classList.add('Nem jó');
    }
    if (password === '' || password == null) {
        errors.push('A jelszó mező nem lehet üres.');
        FelhaszJel.parentElement.classList.add('Nem jó');
    }
    if (password_confirmation === '' || password_confirmation == null) {
        errors.push('A jelszó hitelesítő mező nem lehet üres.');
        JelHit.parentElement.classList.add('Nem jó');
    }
    if (password !== password_confirmation) {
        errors.push('A jelszavak nem egyeznek.');
        FelhaszJel.parentElement.classList.add('Nem jó');
        JelHit.parentElement.classList.add('Nem jó');
    }
    return errors;
}
