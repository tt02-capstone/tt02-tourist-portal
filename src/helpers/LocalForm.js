import {useState, useContext, createContext} from "react";
import {FormProvider} from "./FormProvider";

export const LocalForm = ({children}) => {
    const context = useContext(FormProvider);

    return
}