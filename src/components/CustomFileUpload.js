import React, {useState, useEffect} from "react";
import { View, Text } from "react-native";
import { ToastContainer, toast } from 'react-toastify';
import Button from "./Button"
import AWS from 'aws-sdk';

window.Buffer = window.Buffer || require("buffer").Buffer;

// BACKUP, DO NOT TOUCH THE NEXT 3 LINE OF CODE
// const ACCESS_KEY ='AKIART7KLOHBGOHX2Y7T';
// const SECRET_ACCESS_KEY ='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';
// <img src='http://tt02.s3-ap-southeast-1.amazonaws.com/folderName/dog.jpeg' />
// const S3BUCKET ='tt02';
// const TT02REGION ='ap-southeast-1';
// const ACCESS_KEY ='AKIART7KLOHBGOHX2Y7T';
// const SECRET_ACCESS_KEY ='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';

export default function CustomFileUpload(props) {

  /*
  HOW TO UPLOAD AN IMAGE?
  1. Add the following import. Note that window.Buffer must be immediately after the LAST IMPORT. See line 3 and 4 for an example.
  import Toast from "react-native-toast-message";
  import AWS from 'aws-sdk';
  window.Buffer = window.Buffer || require("buffer").Buffer;
  2. Copy the code from line 35 to 93 into your main class
  3. Add to HTML <CustomFileUpload handleFileChange={handleFileChange} uploadFile={uploadFile}/>
  4. RMB to press the upload button

  HOW TO REFERENCE AN IMAGE UPLOADED
  1. Current (17 Sept) folder name in s3bucket: user , attraction
  2. Take from database str and add it to src attribute of <Image />
  3. Fixed path usage: e.g. <img src='http://tt02.s3-ap-southeast-1.amazonaws.com/attraction/dog.jpeg' /> , where attraction is the folder name and dog.jpeg is the file uploaded
  4. Fix path usage 2: e.g. <img src='http://tt02.s3-ap-southeast-1.amazonaws.com/dog.jpeg' /> , where dog.jpeg is the file uploadedd directly into tt02
  */

  // COPY STARTS HERE
  const S3BUCKET ='tt02'; // if you want to save in a folder called 'attraction', your S3BUCKET will instead be 'tt02/attraction'
  const TT02REGION ='ap-southeast-1';
  const ACCESS_KEY ='AKIART7KLOHBGOHX2Y7T';
  const SECRET_ACCESS_KEY ='xsMGhdP0XsZKAzKdW3ED/Aa5uw91Ym5S9qz2HiJ0';

  const [file, setFile] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const uploadFile = async () => {
    const S3_BUCKET = S3BUCKET;
    const REGION = TT02REGION;

    AWS.config.update({
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_ACCESS_KEY,
    });
    const s3 = new AWS.S3({
      params: { Bucket: S3_BUCKET },
      region: REGION,
    });

    const params = {
      Bucket: S3_BUCKET,
      Key: file.name,
      Body: file,
    };

    var upload = s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        console.log(
          "Uploading " + parseInt((evt.loaded * 100) / evt.total) + "%"
        );
      })
      .promise();

    await upload.then((err, data) => {
      console.log(err);
      Toast.show({
        type: 'success',
        text1: 'Upload Successful'
    })
      setFile(null);
    });
  };

  useEffect(() => {
    if (file) {
      let str = 'http://tt02.s3-ap-southeast-1.amazonaws.com';
      console.log("useEffect", str);
      // Assuming your string to be stored in db is called str.
      // 1. (OPTIONAL IF STORED IN tt02 DIRECTLY) append the folder name to str e.g. stored in attraction folder --> str = str + '/' + 'attraction';
      // 2. append file.name to str e.g. --> str = str + '/' + file.name;
      // 3. pass str to backend api as a path variable or object attribute
    }
  }, [file]);
  // COPY ENDS HERE

  return (
    <View style={props.style}>
        {/* <input type="file" onChange={props.handleFileChange} /> */}
        <Button onClick={props.uploadFile}>
          <Text>Upload</Text>
        </Button>
        <ToastContainer />
    </View>
  );
}