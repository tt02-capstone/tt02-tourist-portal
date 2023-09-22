import {createContext, useEffect, useState} from "react";
import * as SecureStore from 'expo-secure-store';
import axios from "axios";

const TOKEN_KEY= 'token'
const AuthContext = createContext(null);
const {Provider} = AuthContext;

const AuthProvider = ({children}) => {
    const [authState, setAuthState] = useState({
        authenticated: null,
    });

    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            console.log('stored', token )
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
                setAuthState({
                    authenticated: true
                });
            }
        };

        loadToken()
    }, []);

    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        axios.defaults.headers.common['Authorization'] =  ``;
        setAuthState({
            authenticated: false,
        });
    };


    const getAccessToken = async () => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        return token
    };

    return (
        <Provider
            value={{
                authState,
                getAccessToken,
                setAuthState,
                logout,
            }}>
            {children}
        </Provider>
    );
};

export {AuthContext, AuthProvider, TOKEN_KEY};