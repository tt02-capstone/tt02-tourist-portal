import {useState, useContext, createContext} from "react";

export const FormContext = createContext();
export const FormProvider = ({children}) => {

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passportNum, setPassportNum] = useState('');
    const [dob, setDob] = useState('');
    const [mobile, setMobile] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [nric, setNric] = useState('');
    // const [isLocal, setIsLocal] = useState(false);

    return (
        <FormContext.Provider
            value={{
                name,
                email,
                password,
                passportNum,
                dob,
                mobile,
                countryCode,
                nric,
                // isLocal,
                // setIsLocal,
                setMobile,
                setEmail,
                setPassword,
                setDob,
                setName,
                setNric,
                setPassportNum,
                setCountryCode
            }}
        >
            {children}
        </FormContext.Provider>
    )
}