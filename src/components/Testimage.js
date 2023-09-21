import React, { useState } from 'react';
import { Button, Image, View } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'
// import * as ImagePicker from "react-native-image-picker"

export default function Testimage(props) {
  const [selectedImage, setSelectedImage] = useState(null);

  // const openImagePicker = () => {
    // const options = {
    //   mediaType: 'photo',
    //   includeBase64: false,
    //   maxHeight: 2000,
    //   maxWidth: 2000,
    // };

    // launchImageLibrary(options, (response) => {
    //   console.log("here");
    //   if (response.didCancel) {
    //     console.log('User cancelled image picker');
    //   } else if (response.error) {
    //     console.log('Image picker error: ', response.error);
    //   } else {
    //     let imageUri = response.uri || response.assets?.[0]?.uri;
    //     console.log("image chosen");
    //     setSelectedImage(imageUri);
    //   }
    // });
    // };
    const openImagePicker =()=>{
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      };
      
      launchImageLibrary(options, (response) => {
        console.log('Response = ', response);
      
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          const source = { uri: response.uri };
      
          // You can also display the image using data:
          // const source = { uri: 'data:image/jpeg;base64,' + response.data };
      
          console.log(source)
        }
      })};
  
  // handleCameraLaunch = () => {
  //   const options = {
  //     mediaType: 'photo',
  //     includeBase64: false,
  //     maxHeight: 2000,
  //     maxWidth: 2000,
  //   };
  
  //   launchCamera(options, response => {
  //     console.log('Response = ', response);
  //     if (response.didCancel) {
  //       console.log('User cancelled camera');
  //     } else if (response.error) {
  //       console.log('Camera Error: ', response.error);
  //     } else {
  //       // Process the captured image
  //       let imageUri = response.uri || response.assets?.[0]?.uri;
  //       setSelectedImage(imageUri);
  //       console.log(imageUri);
  //     }
  //   });
  // }

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
     {selectedImage && (
          <Image
            source={{ uri: selectedImage }}
            style={{ flex: 1 }}
            resizeMode="contain"
          />
    )}
    <View style={{ marginTop: 20 }}>
      <Button title="Choose from Device" onPress={openImagePicker} />
    </View>
    {/* <View style={{ marginTop: 20,marginBottom: 50 }}>
      <Button title="Open Camera" onPress={handleCameraLaunch} />
    </View> */}
  </View>
  );
};