import express from "express";
import { conn } from "../dbconnect";
import mysql from "mysql";
import multer from "multer";
import path from "path";
import { ImagePostRequest } from "../model/data_post_request";

//create router of this API
export const router = express.Router();

router.get("/perfrom", async (req, res) => {
  const sql = "select * from image";
  conn.query(sql, (err, result) => {
    res.status(200);
    res.json(result);
    console.log(JSON.stringify(result));
  });
  // res.send("Method GET in index.ts");
});

router.get("/randompicture", async (req, res) => {
  conn.query(
    "select * from image order by rand() limit 1",
    (error, result, fileds) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching the random image" });
      }
      const pic1 = result[0];
      conn.query(
        "select * from image where imageID != ? order by rand() limit 1",
        [pic1.imageID],
        (error, result, fileds) => {
          if (error) {
            return res.status(500).json({
              error: "An error occurred while fetching the random image",
            });
          }
          const pic2 = result[0];

          return res.json({ pic1, pic2 });
        }
      );
    }
  );
});

class FileMiddleware {
  filename = "";
  //create multer object to save file in disk
  public readonly diskLoader = multer({
    //diskStorage = save to disk
    storage: multer.diskStorage({
      //destination = folder to be saved
      //folder uploads in this project
      destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
      },
      //define file name to be saved
      filename: (req, file, cb) => {
        //unique file name = date + random number
        const uniqueSuffix =
          Date.now() + "-" + Math.round(Math.random() * 10000);
        this.filename = uniqueSuffix + "." + file.originalname.split(".").pop();
        cb(null, this.filename);
      },
    }),
    //limit file size to be uploaded
    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}

const fileUpload = new FileMiddleware();
//use fileupload object to handle uploading file
router.post("/:id", fileUpload.diskLoader.single("Image"), async (req, res) => {
  // 1. read file data
  const id = req.params.id;
  const name_image = req.body.Name_image;
  const fileDate = req.file?.buffer;
  const filename = fileUpload.filename;
  const filePath = `http://nodeapi-uxch.onrender.com/upload/${filename}`; // กำหนด url

  try {
    let image: ImagePostRequest = req.body;
    let sql =
      "insert into image (userID, imageURL, uploadDate, imageName) values (?, ?, now(), ?)";
    conn.query(sql, [id, filePath, name_image]);

    console.log("Image inserted successfully");
    res.json({
      filename: filename,
      file_path: filePath,
      Name_image: name_image,
    });
  } catch (err) {
    console.error("Error inserting iame:", err);
    res.status(500).send("Error insert image");
  }
});

//get top 10
router.get("/top10", async (req, res) => {
  const sql = `SELECT image.*, user.username, user.avatar, COUNT(vote.imageID) AS voteCount
  FROM image 
  JOIN user ON image.userID = user.userID 
  JOIN vote ON image.imageID = vote.imageID 
  WHERE vote.voteDate = CURRENT_DATE() 
  GROUP BY image.imageID, user.username, user.avatar
  ORDER BY voteCount DESC
  LIMIT 10;`;

  conn.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(result);
    }
  });
  // res.send("Method GET in index.ts");
});

//get image by userID
router.get("/getimage/:id", async (req, res) => {
  const userId = req.params.id;
  console.log("UserID:", userId);
  const sql = "SELECT * FROM image WHERE userID = ?";
  conn.query(sql, [userId], (err, result) => {
    if (err) {
      // Handle error, for example, send a 500 status code
      res.status(500).json({ error: "Internal Server Error" });
      console.error(err);
    } else {
      res.status(200).json(result);
      console.log(JSON.stringify(result));
    }
  });
});

router.get("/top10noid", async (req, res) => {
  const sql = "SELECT * FROM image ORDER BY voteCount DESC LIMIT 10";
  conn.query(sql, (err, result) => {
    res.status(200);
    res.json(result);
    console.log(JSON.stringify(result));
  });
  // res.send("Method GET in index.ts");
});
