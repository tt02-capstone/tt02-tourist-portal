const email = (email) => {
    const re = /\S+@\S+\.\S+/

    if (!email) {
        return "Email can't be empty.";
    }
    return re.test(email) ? '' : 'Ooops! We need a valid email address.';
}

const name = (name) => {
    if (!name) {
        return "Name can't be empty.";
    }
    return ''
}

const password = (password) => {
    if (!password) {
        return "Password can't be empty.";
    }

    return password.length < 5 ? 'Password must be at least 5 characters long.' : '';
}

const passport = (passport) => {
    if (!passport) {
        return "Passport can't be empty.";
    }

    return passport.length > 10 ? 'Passport must not be longer than 10 characters' : '';
}

const mobileNo = (mobileNo) => {
    if (!mobileNo) {
        return "Mobile number can't be empty.";
    }

    return mobileNo.length > 13 ? 'Mobile number must not have more than 10 digits' : '';
}

const nric = (nric) => {
    if (!nric) {
        return "NRIC can't be empty.";
    }

    return nric.length !== 9 ? 'NRIC should be 9 characters' : '';
}
export default {password, email, name, passport, mobileNo, nric}
