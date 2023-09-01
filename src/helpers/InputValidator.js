const emailValidator = (email) => {
    const re = /\S+@\S+\.\S+/
    if (!email)
        return "Email can't be empty."
    if (!re.test(email))
        return 'Ooops! We need a valid email address.'
    return ''
}

const passwordValidator = (password) =>  {
    if (!password) return "Password can't be empty."
    if (password.length < 5) return 'Password must be at least 5 characters long.'
    return ''
}

export default  { passwordValidator, emailValidator }
