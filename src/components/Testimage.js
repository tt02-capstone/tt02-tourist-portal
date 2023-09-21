import React, { useState } from 'react';
import { Button, Image, View, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CameraType } from 'expo-camera';

export default function Testimage(props) {
  const [selectedImage, setSelectedImage] = useState(null);

  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  if (!permission) 

  if (!permission.granted) 

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  const onImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const onCameraPressed = async () => {

  }

  return (
    <View style={{ marginTop: 20,marginBottom: 50 }}>
      <Button title="Choose from Device" onPress={onImagePicker} />
      <Button title="Open Camera" onPress={onCameraPressed} />
    </View>
  );
};