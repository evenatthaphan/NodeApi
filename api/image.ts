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




//get top 10
router.get("/top10", async (req, res) => {
  const sql = `SELECT image.*, user.username, user.avatar, vote.*
  FROM image 
  JOIN user ON image.userID = user.userID 
  JOIN vote ON image.imageID = vote.imageID 
  WHERE vote.voteDate = CURRENT_DATE() 
  ORDER BY image.voteCount DESC
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


router.get("/chart", async (req, res) => {
  const sql = "SELECT DISTINCT userID, imageID, voteCount ,ROW_NUMBER() OVER (ORDER BY voteCount DESC) AS point FROM image";
  conn.query(sql, (err, result) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res.status(500).send("Internal server error");
    } else {
      res.status(200).json(result);
      console.log("Query result:", JSON.stringify(result));
    }
  });
});

router.get("/rank", async (req, res) => {
  const sql = 
    `SELECT imageID, voteScore, ROW_NUMBER() OVER (ORDER BY voteScore DESC) AS rankk
    FROM vote
    WHERE (imageID, voteDate) IN (
        SELECT imageID, MAX(voteDate)
        FROM vote
        WHERE voteDate < CURRENT_DATE
        GROUP BY imageID
    )`;
  
  conn.query(sql, (err, result) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res.status(500).send("Internal server error");
    } else {
      res.status(200).json(result);
      console.log("Query result:", JSON.stringify(result));
    }
  });
});



router.get('/get/diff', (req, res) => {
  // ดึงข้อมูลรูปภาพและคะแนนก่อนการโหวตของวันก่อนหน้า
  const sqlBefore = `SELECT * FROM vote WHERE voteDate = CURDATE() - INTERVAL 1 DAY ORDER BY voteScore DESC`;
  conn.query({sql: sqlBefore, timeout: 60000}, (err, beforeResults) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error fetching photos for the previous day' });
      }

      // ดึงข้อมูลรูปภาพและคะแนนหลังการโหวตของวันปัจจุบัน
      const sqlAfter = `SELECT * FROM vote WHERE voteDate = CURDATE() ORDER BY voteScore DESC LIMIT 10`;
      conn.query({sql: sqlAfter, timeout: 60000}, (err, afterResults) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Error fetching photos for the current day' });
          }

          // คำนวณหาความแตกต่างในอันดับระหว่างวันก่อนหน้าและวันปัจจุบัน
          const rankingsDiff: { imageID: any; voteScore: number; diff: number | null; rank_previous: number; rank_current: number }[] = [];
          afterResults.forEach((afterItem: { imageID: any; voteScore: number; }, index: number) => {
              const beforeIndex = beforeResults.findIndex((item: { imageID: any; }) => item.imageID === afterItem.imageID);
              const rank_previous = beforeIndex !== -1 ? beforeIndex + 1 : null;
              const rank_current = index + 1;
              const diff = rank_previous !== null ? rank_previous - rank_current : null;
              rankingsDiff.push({ imageID: afterItem.imageID, voteScore: afterItem.voteScore, diff, rank_previous, rank_current });
          });
          console.log(rankingsDiff);
          res.json(rankingsDiff);
      });
  });
});


router.delete("/delete/:id", (req, res) => {
  let id = +req.params.id;
  conn.query("delete from image where imageID = ?", [id], (err, result) => {
     if (err) throw err;
     res
       .status(200)
       .json({ affected_row: result.affectedRows });
  });
});