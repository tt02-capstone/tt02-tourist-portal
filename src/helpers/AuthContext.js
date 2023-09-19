import {createContext, useEffect, useState} from "react";
import * as SecureStore from 'expo-secure-store';
import axios from "axios";
import {updateApiInstances} from "./api";


const TOKEN_KEY= 'token'
const AuthContext = createContext(null);
const {Provider} = AuthContext;

const AuthProvider = ({children}) => {
    const [authState, setAuthState] = useState({
        accessToken: null,
        authenticated: null,
    });

    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            console.log('stored', token )
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
                setAuthState({
                    accessToken: token,
                    authenticated: true
                });
            }
        };

        loadToken()
    }, []);
    

    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        updateApiInstances('')
        setAuthState({
            accessToken: null,
            authenticated: false,
        });
    };


    const getAccessToken = () => {
        return authState.accessToken;
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