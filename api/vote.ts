import express from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";

//create router of this API
export const router = express.Router();

//คำนวนคะแนน
router.post("/voteimage/elo", async (req, res) => {
  const imageID_1 = req.body.imageID_1;
  const imageID_2 = req.body.imageID_2;
  const voteCount1 = req.body.voteCount1;
  const voteCount2 = req.body.voteCount2;

  console.log(imageID_1);
  console.log(imageID_2);
  console.log(voteCount1);
  console.log(voteCount2);

  let r1: number, r2: number;

  conn.query(
    "select * from image where imageID = ?",
    [imageID_1],
    (error, result1) => {
      if (error) {
        return res.status(500).json({
          error: "An error occurred while fetching the vote image1",
        });
      }
      r1 = result1[0].voteCount;

      conn.query(
        "select * from image where imageID = ?",
        [imageID_2],
        (error, result2) => {
          if (error) {
            return res.status(500).json({
              error: "An error occurred while fetching the vote image2",
            });
          } else {
            r2 = result2[0].voteCount;
            console.log(r1);
            console.log(r2);

            //แทนค่าคะแนนเดิมคำนวนหาค่า e1 e2
            const e1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
            const e2 = 1 / (1 + Math.pow(10, (r1 - r2) / 400));
            console.log("e1=" + e1);
            console.log("e2=" + e2);

            const k = 32;
            const rp1: number = r1 + k * (voteCount1 - e1);
            const rp2: number = r2 + k * (voteCount2 - e2);
            console.log("rp1=" + rp1);
            console.log("rp2=" + rp2);

            const currentDate = new Date();
            const day = currentDate.getDate() + 1;
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const formattedDate = `${year}-${month}-${day}`;
            console.log(formattedDate);
            
            conn.query(
              "select voteDate from vote where voteDate = ? and imageID = ?",
              [formattedDate, result1[0].imageID],
              (error, result3) => {
                if (error) {
                  return res.status(500).json({
                    error: "An error occurred while fetching image1",
                  });
                } else {
                  if (result3.length == 0) {
                    const sql =
                      "insert into `vote` (`imageID`, `voteDate`, `voteScore`) values (?, ?, ?)";
                    conn.query(
                      sql,
                      [imageID_1, formattedDate, rp1],
                      (err, result) => {
                        if (err) {
                          console.error("Error inserting user: ", err);
                          res
                            .status(500)
                            .json({ error: "Error inserting user" });
                        } else {
                          const sql =
                            "update `image` set `voteCount` = ? where `imageID` = ?";
                          conn.query(sql, [rp2, imageID_2], (err, result) => {
                            if (err) {
                              console.error("Error inserting user: ", err);
                              return res
                                .status(500)
                                .json({ error: "Error inserting user" });
                            }
                          });
                        }
                      }
                    );
                  } else {
                    const sql =
                      "update `vote` set `voteScore` = ? where `imageID` = ? and `voteDate` = ?";
                    conn.query(
                      sql,
                      [rp1, imageID_1, formattedDate],
                      (err, result) => {
                        if (err) {
                          console.error("Error inserting user: ", err);
                          res
                            .status(500)
                            .json({ error: "Error inserting user" });
                        } else {
                          const sql =
                            "update `image` set `voteCount` = ? where `imageID` = ?";
                          conn.query(sql, [rp1, imageID_1], (err, result) => {
                            if (err) {
                              console.error("Error inserting user: ", err);
                              return res
                                .status(500)
                                .json({ error: "Error inserting user" });
                            }
                          });
                        }
                      }
                    );
                  }
                }
              }
            );

            conn.query(
              "select voteDate from vote where voteDate = ? and imageID = ? ",
              [formattedDate, result2[0].imageID],
              (error, result4) => {
                if (error) {
                  return res.status(500).json({
                    error: "An error occurred while fetching image2",
                  });
                } else {
                  if (result4.length == 0) {
                    const sql =
                      "insert into `vote` (`imageID`, `voteDate`, `voteScore`) values (?, ?, ?)";
                    conn.query(
                      sql,
                      [imageID_2, formattedDate, rp2],
                      (err, result) => {
                        if (err) {
                          console.error("Error inserting user: ", err);
                          return res
                            .status(500)
                            .json({ error: "Error inserting user" });
                        } else {
                          const sql =
                            "update `image` set `voteCount` = ? where `imageID` = ?";
                          conn.query(sql, [rp2, imageID_2], (err, result) => {
                            if (err) {
                              console.error("Error inserting user: ", err);
                              return res
                                .status(500)
                                .json({ error: "Error inserting user" });
                            }
                          });
                        }
                      }
                    );
                  } else {
                    const sql =
                      "update `vote` set `voteScore` = ? where `imageID` = ?  and `voteDate` = ?";
                    conn.query(
                      sql,
                      [rp2, imageID_2, formattedDate],
                      (err, result) => {
                        if (err) {
                          console.error("Error inserting user: ", err);
                          return res
                            .status(500)
                            .json({ error: "Error inserting user" });
                        } else {
                          const sql =
                            "update `image` set `voteCount` = ? where `imageID` = ?";
                          conn.query(sql, [rp2, imageID_2], (err, result) => {
                            if (err) {
                              console.error("Error inserting user: ", err);
                              return res
                                .status(500)
                                .json({ error: "Error inserting user" });
                            }
                          });
                        }
                      }
                    );
                  }
                }
              }
            );
          }
        }
      );
    }
  );
});


router.get("/all", async (req, res) => {
  const sql = "select * from vote";
  conn.query(sql, (err, result) => {
    res.status(200);
    res.json(result);
    console.log(JSON.stringify(result));
  });
  // res.send("Method GET in index.ts");
});



// router.get("/score/statistics",(req, res) => {
//   const username = req.query.username;
//   console.log(username);

//   const yesterday = new Date();
//   yesterday.setDate(yesterday.getDate() - 7);
//   const yesterdayDay = yesterday.getDate() + 1;
//   console.log(yesterdayDay);
//   const yesterdayMonth = yesterday.getMonth() + 1;
//   const yesterdayYear = yesterday.getFullYear();
//   const formattedyesterday= `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;

//   const currentDate = new Date();
//   const day = currentDate.getDate();
//   const month = currentDate.getMonth() + 1;
//   const year = currentDate.getFullYear();
//   const formattedDate = `${year}-${month}-${day}`
//   console.log(formattedDate);

//   const sql: string = `select * from vote join image on vote.imageID = image.imageID 
//   join user on image.userID = user.userID where user.username = ? order by image.imageID`;
//   conn.query(sql,[username],(err, results) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }

//     res.json(results);
//     console.log(results);
//   })

// });


router.get("/statistics", (req, res) => {
  const imageID = req.query.imageID;
  console.log(imageID);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 7);
  const yesterdayDay = yesterday.getDate();
  console.log(yesterdayDay);
  const yesterdayMonth = yesterday.getMonth() + 1;
  const yesterdayYear = yesterday.getFullYear();
  const formattedYesterday = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;

  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const formattedDate = `${year}-${month}-${day}`;
  console.log(formattedDate);

  const sql = `SELECT * 
              FROM vote 
              JOIN image ON vote.imageID = image.imageID 
              JOIN user ON image.userID = user.userID 
              WHERE image.imageID = ? 
              AND vote.voteDate BETWEEN 2024-3-4 AND CURRENT_DATE()
              ORDER BY image.imageID`;

  conn.query(sql, [imageID], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.json(results);
    console.log(results);
  });
});


// router.post("/voteimage/elo/:imageID_1/:imageID_2/:voteCount1/:voteCount2", async (req, res) => {
//   const imageID_1 = req.params.imageID_1;
//   const imageID_2 = req.params.imageID_2;
//   const voteCount1 = +req.params.voteCount1;
//   const voteCount2 = +req.params.voteCount2;

//   try {
//     // Fetch vote count for image1
//     const result1 = await queryAsync("SELECT * FROM image WHERE imageID = ?", [imageID_1]);
//     const r1 = result1[0].voteCount;

//     // Fetch vote count for image2
//     const result2 = await queryAsync("SELECT * FROM image WHERE imageID = ?", [imageID_2]);
//     const r2 = result2[0].voteCount;

//     console.log(r1);
//     console.log(r2);

//     const e1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
//     const e2 = 1 / (1 + Math.pow(10, (r1 - r2) / 400));

//     console.log("e1=" + e1);
//     console.log("e2=" + e2);

//     const rp1: number = r1 + 32 * (voteCount1 - e1);
//     const rp2: number = r2 + 32 * (voteCount2 - e2);

//     console.log("rp1=" + rp1);
//     console.log("rp2=" + rp2);

//     const currentDate = new Date();
//     const day = currentDate.getDate();
//     const month = currentDate.getMonth() + 1;
//     const year = currentDate.getFullYear();
//     const formattedDate = `${year}-${month}-${day}`;

//     // Update vote and image for image1
//     await updateVoteAndImage(imageID_1, rp1, formattedDate);

//     // Update vote and image for image2
//     await updateVoteAndImage(imageID_2, rp2, formattedDate);

//     res.json({ success: true, message: "Vote successful!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // ฟังก์ชันสำหรับ query database โดยใช้ Promise
// function queryAsync(sql, values) {
//   return new Promise((resolve, reject) => {
//     conn.query(sql, values, (error, result) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// }

// // ฟังก์ชันสำหรับ update vote และ image โดยใช้ Promise
// async function updateVoteAndImage(imageID, voteScore, formattedDate) {
//   try {
//     // Check if the voteDate exists for the given imageID
//     const result = await queryAsync("SELECT voteDate FROM vote WHERE voteDate = ? AND imageID = ?", [formattedDate, imageID]);

//     if (result.length === 0) {
//       // Insert vote record
//       await queryAsync("INSERT INTO vote (imageID, voteDate, voteScore) VALUES (?, ?, ?)", [imageID, formattedDate, voteScore]);

//       // Update image voteCount
//       await queryAsync("UPDATE image SET voteCount = ? WHERE imageID = ?", [voteScore, imageID]);
//     }
//   } catch (error) {
//     throw error;
//   }
// }
