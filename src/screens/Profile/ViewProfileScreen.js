import React, {useState, useEffect} from 'react'
import { useIsFocused } from "@react-navigation/native";
import Header from '../../components/Header'
import Button from "../../components/Button";
import { getUser } from '../../helpers/LocalStorage'
import moment from 'moment'

export const ViewProfileScreen = ({route, navigation}) => {

    const isFocused = useIsFocused();
    const [user, setUser] = useState();

    useEffect(() => {
        async function fetchData() {
            console.log("view profile fetch");
            const userData = await getUser()
            setUser(userData)
        }

        if (isFocused) {
            fetchData();   
        }

    }, [isFocused])

    return user ? (
        <div>
            <Header>
                {user.name} Profile
                <br />
                <Button text="Edit Profile" onPress={() => navigation.navigate('EditProfileScreen')} />
                <br />
            </Header>
            
            {/* shared view profile */}
            {user.email}
            <br />
            {moment(user.date_of_birth).format('LL')}
            <br />
            {'+' + user.country_code + " " + user.mobile_num}
            <br />
            <Button text="Edit Password" onPress={() => navigation.navigate('EditPasswordScreen')} />
        </div>
    ) : 
    (<div></div>)
}