const email = (email) => {
    const re = /\S+@\S+\.\S+/

    if (!email) {
        return "Email can't be empty!";
    }
    return re.test(email) ? '' : 'Please use a valid email address!';
}

const name = (name) => {
    if (!name) {
        return "Name can't be empty!";
    }
    return ''
}

const password = (password) => {
    var regExp = /[a-zA-Z]/g;
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if (!password) {
        return "Password can't be empty!";
    } else if (!regExp.test(password)) {
        return "Password must contain at least 1 letter!";
    } else if (/[0-9]/.test(password) === false) {
        return "Password must contain at least 1 number!";
    } else if (!format.test(password)) {
        return "Password must contain at least 1 symbol!";
    }

    return password.length < 8 ? 'Password must be at least 8 characters long!' : '';
}

const passport = (passport) => {
    if (!passport) {
        return "Passport can't be empty!";
    }

    return passport.length > 10 ? 'Passport must not be longer than 10 characters!' : '';
}

const confirmPassword = (originalp, newp) => {
    if (originalp !== newp) {
        return "Password do not match!";
    }
    return ''
}

const countryCode = (countryCode) => {
    if (!countryCode) {
        return "Country code can't be empty!";
    }

    return mobileNo.length > 3 ? 'Please enter a valid country code!' : '';
}

const mobileNo = (mobileNo) => {
    if (!mobileNo) {
        return "Mobile number can't be empty!";
    }

    return mobileNo.length > 13 ? 'Mobile number must not have more than 10 digits!' : '';
}

const nric = (nric) => {
    if (!nric) {
        return "NRIC can't be empty!";
    }
    return nric.length !== 9 ? 'NRIC should be 9 characters!' : '';
}

const dob = (date) => {
    if (!date) {
        return "Date of birth can't be empty!";
    }

    return '';
}

export default {password, email, name, passport, countryCode, mobileNo, nric, confirmPassword, dob}
