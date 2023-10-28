import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, LogBox } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from '@react-navigation/drawer';
import Toast from 'react-native-toast-message';
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { ResetPasswordScreen } from "./src/screens/ForgetPassword/ResetPasswordScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgetPassword/ForgotPasswordScreen";
import { SignUpScreen } from "./src/screens/SignUp/SignUpScreen";
import { CodeVerificationScreen } from "./src/screens/ForgetPassword/CodeVerificationScreen";
import { ViewProfileScreen } from './src/screens/Profile/ViewProfileScreen';
import { EditProfileScreen } from './src/screens/Profile/EditProfileScreen';
import { EditPasswordScreen } from './src/screens/Profile/EditPasswordScreen';
import {AuthContext, AuthProvider} from "./src/helpers/AuthContext";
import {useContext, useEffect} from "react";
import {Cart} from "./src/components/Cart";
import AttractionScreen from "./src/screens/Attraction/AttractionScreen";
import AttractionDetailsScreen from "./src/screens/Attraction/AttractionDetailsScreen";
import TelecomScreen from './src/screens/Telecom/TelecomScreen';
import TelecomDetailsScreen from './src/screens/Telecom/TelecomDetailsScreen';
import BookingHistoryScreen from "./src/screens/Booking/BookingHistoryScreen";
import BookingDetailsScreen from "./src/screens/Booking/BookingDetailsScreen";
import PaymentHistoryScreen from "./src/screens/PaymentHistoryScreen";
import SavedListingScreen from "./src/screens/Profile/SaveListingScreen";
import AccommodationScreen from "./src/screens/Accommodation/AccommodationScreen";
import AccommodationDetailsScreen from "./src/screens/Accommodation/AccommodationDetailsScreen";
import {CreditCardsScreen} from "./src/screens/CreditCard/CreditCardsScreen";
import {AddCreditCardScreen} from "./src/screens/CreditCard/AddCreditCardScreen";
import {CreditCardScreen} from "./src/screens/CreditCard/CreditCardScreen";
import {CartScreen} from "./src/screens/Cart/CartScreen";
import {CheckoutScreen} from "./src/screens/Cart/CheckoutScreen";
import { enGB,en, registerTranslation } from 'react-native-paper-dates'
import { initStripe } from '@stripe/stripe-react-native';
import {EmailVerificationScreen} from "./src/screens/SignUp/EmailVerificationScreen";
import TourScreen from './src/screens/Attraction/TourScreen';
import TourDetailsScreen from './src/screens/Attraction/TourDetailsScreen';
import DealScreen from "./src/screens/Deal/DealScreen";
import RestaurantScreen from './src/screens/Restaurant/RestaurantScreen';
import RestaurantDetailsScreen from './src/screens/Restaurant/RestaurantDetailsScreen';
import SupportTicketScreen from './src/screens/SupportTicket/SupportTicketScreen';
import SupportTicketDetailsScreen from './src/screens/SupportTicket/SupportTicketDetailsScreen';
import CreateSupportTicketScreen from './src/screens/SupportTicket/CreateSupportTicketScreen';
import EditSupportTicketScreen from './src/screens/SupportTicket/EditSupportTicketScreen';
import EditReplyScreen from './src/screens/SupportTicket/EditReplyScreen';
import ApplyDealScreen from "./src/screens/Deal/ApplyDealScreen";
import CategoryScreen from './src/screens/Forum/CategoryScreen';
import CategoryItemScreen from './src/screens/Forum/CategoryItemScreen';
import PostListScreen from './src/screens/Forum/PostListScreen';
import { CreatePostScreen } from './src/screens/Forum/CreatePostScreen';
import { UpdatePostScreen } from './src/screens/Forum/UpdatePostScreen';
import PostScreen from './src/screens/Forum/PostScreen';
import { ReportPostScreen } from './src/screens/Forum/ReportPostScreen';
import { ForumProfileScreen } from './src/screens/Forum/ForumProfileScreen';
import { ReportCommentScreen } from './src/screens/Forum/ReportCommentScreen';
import { BadgesScreen } from './src/screens/Profile/BadgesScreen';
import registerNNPushToken from 'native-notify';
import NotificationScreen from './src/screens/Notification/NotificationScreen';
import ItineraryScreen from './src/screens/Itinerary/ItineraryScreen';
import CreateItineraryScreen from './src/screens/Itinerary/CreateItineraryScreen';
import EditItineraryScreen from './src/screens/Itinerary/EditItineraryScreen';
import CreateAttractionDIYEventScreen from './src/screens/Attraction/CreateAttractionDIYEventScreen';
import CreateDIYEventScreen from './src/screens/Itinerary/CreateDIYEventScreen';
import SendNotificationScreen from './src/screens/Notification/SendNotificationScreen';
import { CommonHeader } from './src/screens/CommonHeader';
import CreateAccommodationDIYEventScreen from './src/screens/Accommodation/CreateAccommodationDIYEventScreen';
import CreateTelecomDIYEventScreen from './src/screens/Telecom/CreateTelecomDIYEventScreen';
import EditDIYEventScreen from './src/screens/Itinerary/EditDIYEventScreen';

LogBox.ignoreAllLogs(true)

initStripe({
  // API Key is test key, will be masked via GitHub Actions for deployment
  publishableKey: 'pk_test_51NmFq8JuLboRjh4q4oxGO4ZUct2x8EzKnOtukgnrwTU2rr7A8AcL33OpPxtxGPLHoqCspNQtRA0M1P1uuaViRXNF00HZxqJgEg',
});

registerTranslation('en-GB', enGB)
registerTranslation('en', en)
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
    registerNNPushToken(13960, 'BEbA270k2T53VV6Cu8pZIZ');

    return (
        <AuthProvider>
            <Layout>
            </Layout>
        </AuthProvider>
    );
}

function MyDrawer() {
    return (
      <Drawer.Navigator screenOptions={{ headerRight: () => <CommonHeader /> }}>
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Profile" component={ViewProfileScreen} />
        <Drawer.Screen name="Saved Listings" component={SavedListingScreen} />
        <Drawer.Screen name="Forum" component={CategoryScreen} />
        <Drawer.Screen name="Itinerary" component={ItineraryScreen} />
        <Drawer.Screen name="Attractions" component={AttractionScreen} />
        <Drawer.Screen name="Accommodations" component={AccommodationScreen} />
        <Drawer.Screen name="Telecoms" component={TelecomScreen} />
        <Drawer.Screen name="Restaurants" component={RestaurantScreen} />
        <Drawer.Screen name="Deals" component={DealScreen} />
        <Drawer.Screen name="Bookings" component={BookingHistoryScreen} />
        <Drawer.Screen name="Payments" component={PaymentHistoryScreen} />
        <Drawer.Screen name="Support Tickets" component={SupportTicketScreen} />
        <Drawer.Screen name="Send Notification" component={SendNotificationScreen} />
      </Drawer.Navigator>
    );
}

export const Layout = () => {
    const {authState} = useContext(AuthContext);

    useEffect(() => {
        // console.log("auth-state:", authState)
        // console.log('authenticated', authState.authenticated)
    }, [authState]);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{
                headerRight: () => <CommonHeader />,
            }} initialRouteName="LoginScreen">
                {authState?.authenticated? (
                    <>
                        <Stack.Screen name="Drawer" component={MyDrawer} options={{ headerShown: false }} />
                        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{title: 'Home '}}/>
                        <Stack.Screen name="ViewProfileScreen" component={ViewProfileScreen} options={{title: 'View Profile'}}/>
                        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{title: 'Edit Profile'}}/>
                        <Stack.Screen name="EditPasswordScreen" component={EditPasswordScreen} options={{title: 'Edit Password'}}/>
                        <Stack.Screen name="AttractionScreen" component={AttractionScreen} options={{ title : 'Attractions' }} />
                        <Stack.Screen name="AttractionDetailsScreen" component={ AttractionDetailsScreen} options={{ title : 'Attractions' }} />
                        <Stack.Screen name="AccommodationScreen" component={AccommodationScreen} options={{ title : 'Accommodations' }} />
                        <Stack.Screen name="AccommodationDetailsScreen" component={ AccommodationDetailsScreen} options={{ title : 'Accommodations' }} />
                        <Stack.Screen name="TelecomScreen" component={TelecomScreen} options={{ title : 'Telecoms' }} />
                        <Stack.Screen name="TelecomDetailsScreen" component={TelecomDetailsScreen} options={{ title : 'Telecoms' }} />
                        <Stack.Screen name="DealScreen" component={DealScreen} options={{ title : 'Deals' }} />
                        <Stack.Screen name="ApplyDealScreen" component={ApplyDealScreen} options={{ title : 'Apply Deal Screen' }} />
                        <Stack.Screen name="RestaurantScreen" component={RestaurantScreen} options={{ title : 'Restaurant' }} />
                        <Stack.Screen name="RestaurantDetailsScreen" component={RestaurantDetailsScreen} options={{ title : 'Restaurant' }} />
                        <Stack.Screen name="BookingHistoryScreen" component={ BookingHistoryScreen} options={{ title : 'Booking History' }} />
                        <Stack.Screen name="BookingDetailsScreen" component={ BookingDetailsScreen} options={{ title : 'Booking Details' }} />
                        <Stack.Screen name="PaymentHistoryScreen" component={ PaymentHistoryScreen} options={{ title : 'Payment History' }} />
                        <Stack.Screen name="SavedListingScreen" component={ SavedListingScreen } options={{ title : 'Saved Listing' }} />
                        <Stack.Screen name="CreditCardsScreen" component={CreditCardsScreen} options={{title: 'My Credit Cards'}}/>
                        <Stack.Screen name="AddCreditCardScreen" component={AddCreditCardScreen} options={{title: 'Add Credit Card'}}/>
                        <Stack.Screen name="CreditCardScreen" component={CreditCardScreen} options={{title: 'View Credit Card'}}/>
                        <Stack.Screen name="CartScreen" component={CartScreen} options={{ title : 'My Cart' }} />
                        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} options={{ title : 'Book Now' }} />
                        <Stack.Screen name="TourScreen" component={TourScreen} options={{ title : 'Tours' }} />
                        <Stack.Screen name="TourDetailsScreen" component={TourDetailsScreen} options={{ title : 'Tour Details' }} />
                        <Stack.Screen name="SupportTicketScreen" component={SupportTicketScreen} options={{ title : 'Support Tickets' }} />
                        <Stack.Screen name="SupportTicketDetailsScreen" component={SupportTicketDetailsScreen} options={{ title : 'Ticket Details' }} />
                        <Stack.Screen name="CreateSupportTicketScreen" component={CreateSupportTicketScreen} options={{ title : 'Create Support Ticket' }} />
                        <Stack.Screen name="EditSupportTicketScreen" component={EditSupportTicketScreen} options={{ title : 'Edit Ticket' }} />
                        <Stack.Screen name="EditReplyScreen" component={EditReplyScreen} options={{ title : 'Edit Reply' }} />
                        <Stack.Screen name="CategoryScreen" component={CategoryScreen} options={{ title : 'Forum' }} />
                        <Stack.Screen name="CategoryItemScreen" component={CategoryItemScreen} options={{ title : 'Forum' }} />
                        <Stack.Screen name="PostListScreen" component={PostListScreen} options={{ title : 'Posts' }} />
                        <Stack.Screen name="CreatePostScreen" component={CreatePostScreen} options={{ title : 'Create Post' }} />
                        <Stack.Screen name="UpdatePostScreen" component={UpdatePostScreen} options={{ title : 'Update Post' }} />
                        <Stack.Screen name="PostScreen" component={PostScreen} options={{ title : 'Post' }} />
                        <Stack.Screen name="ForumProfileScreen" component={ForumProfileScreen} options={{ title : 'Forum User Details' }} />
                        <Stack.Screen name="ReportPostScreen" component={ReportPostScreen} options={{ title : 'Report Post' }} />
                        <Stack.Screen name="ReportCommentScreen" component={ReportCommentScreen} options={{ title : 'Report Comment' }} />
                        <Stack.Screen name="BadgesScreen" component={BadgesScreen} options={{ title : 'Badges' }} />
                        <Stack.Screen name="ItineraryScreen" component={ItineraryScreen} options={{ title : 'Itinerary' }} />
                        <Stack.Screen name="CreateItineraryScreen" component={CreateItineraryScreen} options={{ title : 'Create Itinerary' }} />
                        <Stack.Screen name="EditItineraryScreen" component={EditItineraryScreen} options={{ title : 'Edit Itinerary' }} />
                        <Stack.Screen name="CreateDIYEventScreen" component={CreateDIYEventScreen} options={{ title : 'Create New Event' }} />
                        <Stack.Screen name="CreateAttractionDIYEventScreen" component={CreateAttractionDIYEventScreen} options={{ title : 'Add to Itinerary' }} />
                        <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ title : 'Notification' }} />
                        <Stack.Screen name="CreateAccommodationDIYEventScreen" component={CreateAccommodationDIYEventScreen} options={{ title : 'Add to Itinerary' }} />
                        <Stack.Screen name="CreateTelecomDIYEventScreen" component={CreateTelecomDIYEventScreen} options={{ title : 'Add to Itinerary' }} />
                        <Stack.Screen name="EditDIYEventScreen" component={EditDIYEventScreen} options={{ title : 'Edit Event' }} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{title: 'Login '}}/>
                        <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{title: 'Sign Up '}}/>
                        <Stack.Screen name="CodeVerificationScreen" component={CodeVerificationScreen} options={{title: 'Verify Code'}}/>
                        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{title: 'Reset Password'}}/>
                        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{title: 'Forgot Password'}}/>
                        <Stack.Screen name="EmailVerificationScreen" component={EmailVerificationScreen} options={{title: 'Verify Email'}}/>
                    </>
                )}
            </Stack.Navigator>
            <Toast/>
        </NavigationContainer>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
