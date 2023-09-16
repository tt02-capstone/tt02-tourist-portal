import React , { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { ListItem, Button } from '@rneui/themed';
import { clearStorage, getUser, getUserType } from '../helpers/LocalStorage';
import { cartApi } from '../helpers/api';

export const CartScreen = ({navigation}) => {
    const [user, setUser] = useState('');
  // Sample data for your cart items
  const cartItems = [
    { id: '1', name: 'Item 1', price: '$10' },
    { id: '2', name: 'Item 2', price: '$15' },
    // Add more cart items as needed
  ];

  useEffect(() => {
    async function onLoad() {
        
      try {
        
        const user_type = await getUserType();
        const userData = await getUser()
        setUser(userData)
        const tourist_email = userData.email
        const response = await cartApi.get(`/viewCart/${user_type}/${tourist_email}`)
          if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
              console.log('error',response.data)
              //return JSON.parse(response.data);

          } else {
              console.log(response.data)
          }


      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    }

    onLoad();
  }, []);

  return (
    <View>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem.Swipeable
            leftContent={
              <Button
                title="Edit"
                icon={{ name: 'edit' }}
                onPress={() => {
                  // Handle edit action
                }}
              />
            }
            rightContent={
              <Button
                title="Delete"
                icon={{ name: 'delete' }}
                onPress={() => {
                  // Handle delete action
                }}
              />
            }
          >
            <ListItem.Content>
              <ListItem.Title>{item.name}</ListItem.Title>
              <ListItem.Subtitle>{item.price}</ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem.Swipeable>
        )}
      />
    </View>
  );
};

