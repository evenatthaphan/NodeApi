import express from "express";
import path from "path";
import multer from "multer";
import { conn } from "../dbconnect";
import { ImagePostRequest } from "../model/data_post_request";
// import mysql from "mysql";

export const router = express.Router();

//เชื่อม firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getStorage, ref,uploadBytesResumable,getDownloadURL} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCNAXKjHaISwfyPpPR9MIV3ebxchs2Pgxo",
  authDomain: "anime-mash---app---eve.firebaseapp.com",
  projectId: "anime-mash---app---eve",
  storageBucket: "anime-mash---app---eve.appspot.com",
  messagingSenderId: "61740520109",
  appId: "1:61740520109:web:c841c429bd225ec814ac24",
  measurementId: "G-RG8GHMN3G5"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const storage = getStorage();


class FileMiddleware {
  filename = "";
  public readonly diskLoader = multer({
    //
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 67108864, // 64 MByte
  },
});
}

const fileUpload = new FileMiddleware(); 
router.post("/", fileUpload.diskLoader.single("Photo"), async (req, res) => {
  try {
    // อัพโหลดรูปภาพไปยัง Firebase Storage
    const filename = Date.now() + "-" + Math.round(Math.random() * 1000) + ".png";
    const storageRef = ref(storage, "/images/" + filename);
    const metadata = { contentType: req.file!.mimetype };
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
    const url = await getDownloadURL(snapshot.ref);

    // บันทึกรูปภาพลงใน Firebase Storage และรับ URL ของรูปภาพ
    const Photo = url;

    // บันทึกข้อมูลลงในฐานข้อมูล MySQL
    const UserID: ImagePostRequest = req.body;
    const sql = "INSERT INTO image (imageID, userID, imageURL, uploadDate, imageName) VALUES (?, ?, ?, NOW(), ? )";
    conn.query(sql, [UserID.userID, UserID.imageName, Photo], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error inserting user' });
      }
      res.status(201).json({ Photo: Photo, result });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading image and inserting user' });
  }
});