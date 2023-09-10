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

const password = (password) =>  {
    if (!password) {
        return "Password can't be empty.";
    }

    return password.length < 5 ? 'Password must be at least 5 characters long.' : '';
}

export default  { password, email, name }
