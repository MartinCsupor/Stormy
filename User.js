const form = document.getElementById('form');
const FelhaszEmail = document.getElementById('email');
const felhaszN = document.getElementById('felhaszNev');
const FelhaszJel = document.getElementById('jelszo');
const JelHit = document.getElementById('jelszoHit');

form.addEventListener('kuldes',  (e) => {
    e.preventDefault();

    const email = FelhaszEmail.value;
    const username = felhaszN.value;
    const password = FelhaszJel.value;
    const password_confirmation = JelHit.value;

    let errors = [];
    
    if (FelhaszEmail){
        errors=getSignUpErrors(FelhaszEmail.value, felhaszN.value, FelhaszJel.value, JelHit.value);
    }
    else {
        errors=getSignUpErrors(felhaszN.value, FelhaszJel.value);
    }
    if (errors.length > 0) {
        e.preventDefault();
    }
        
});

function getSignUpErrors(FelhaszEmail, felhaszN, FelhaszJel, JelHit) {
    let errors = []; 
    if(FelhaszEmail === '' || FelhaszEmail== null) {
        errors.push('Az email mező nem lehet üres.');
        FelhaszEmail.parentElement.classList.add('Nem jó');
    }
    if(felhaszN === '' || felhaszN== null) {
        errors.push('A felhasznaló mező nem lehet üres.');
        felhaszN.parentElement.classList.add('Nem jó');
    }
    if(FelhaszJel === '' || FelhaszJel== null) {
        errors.push('Az jelszó mező nem lehet üres.');
        FelhaszJel.parentElement.classList.add('Nem jó');
    }
    if(JelHit === '' || JelHit== null) {
        errors.push('Az jelszó hitelesitő mező nem lehet üres.');
        JelHit.parentElement.classList.add('Nem jó');
    }
    return errors;
}