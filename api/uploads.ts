import express from "express";
import multer from "multer";
import path from "path";

//create router of this API
export const router = express.Router();

router.get("/", (req, res) => {
  res.send("Method GET in uploads.ts");
});

//บันทึกลงในเครื่อง
// class FileMiddleware {
//     filename = "";
//     //create multer object to save file in disk
//     public readonly diskLoader = multer({
//       //diskStorage = save to disk
//       storage: multer.diskStorage({
//         //destination = folder to be saved
//         //folder uploads in this project
//         destination: (_req, _file, cb) => {
//           cb(null, path.join(__dirname, "../uploads"));
//         },
//         //define file name to be saved
//         filename: (req, file, cb) => {
//             //unique file name = date + random number
//           const uniqueSuffix =
//             Date.now() + "-" + Math.round(Math.random() * 10000);
//           this.filename = uniqueSuffix + "." + file.originalname.split(".").pop();
//           cb(null, this.filename);
//         },
//       }),
//       //limit file size to be uploaded
//       limits: {
//         fileSize: 67108864, // 64 MByte
//       },
//     });
//   }

// //Post Upload
// const fileUpload = new FileMiddleware();
// //use fileupload object to handle uploading file
// router.post("/",fileUpload.diskLoader.single("file"),(req, res)=>{
//     res.status(200).json(
//         {
//             filename : "/uploads/" + fileUpload.filename
//         }
//     )
// });

//Define configuletion
const firebaseConfig = {
  apiKey: "AIzaSyC2ZW7nOQKkrQwVM0qfSBKWwDWLeFqZev4",
  authDomain: "tripbooking-app-eve.firebaseapp.com",
  projectId: "tripbooking-app-eve",
  storageBucket: "tripbooking-app-eve.appspot.com",
  messagingSenderId: "738801310521",
  appId: "1:738801310521:web:71bb8bcf00d1cf84da26e8",
  measurementId: "G-28B38MSGSB",
};
//import libs
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
//start connecting to firebase
initializeApp(firebaseConfig);

//create object
const storage = getStorage();

class FileMiddleware {
  filename = "";
  //create multer object to save file in disk
  public readonly diskLoader = multer({
    //diskStorage = save to disk
    storage: multer.memoryStorage(),
    //limit file size to be uploaded
    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}

//Post Upload
const fileUpload = new FileMiddleware();
//use fileupload object to handle uploading file
router.post("/", fileUpload.diskLoader.single("file"), async (req, res) => {
  //create filename
  const filename = Math.round(Math.random() * 10000) + ".png";
  //set name to be saved on firebase storage
  const storageRef = ref(storage, "images/" + filename);
  //set detail of file to be uploaded
  const metadata = {
    contentType: req.file!.mimetype,
  };
  //upload to storage
  const snapshot = await uploadBytesResumable(
    storageRef,
    req.file!.buffer,
    metadata
  );

  //get url of image from storage

  
  const downloadurl = await getDownloadURL(snapshot.ref);
  res.status(200).json({
    filename: downloadurl,
  });
});
