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

            // const currentDate = new Date();
            // const day = currentDate.getDate();
            // const month = currentDate.getMonth() + 1;
            // const year = currentDate.getFullYear();
            // const formattedDate = `${year}-${month}-${day}`;
            // console.log(formattedDate);

            conn.query(
              "select voteDate from vote where voteDate = CURDATE() and imageID = ?",
              [result1[0].imageID],
              (error, result3) => {
                if (error) {
                  return res.status(500).json({
                    error: "An error occurred while fetching image1",
                  });
                } else {
                  if (result3.length == 0) {
                    const sql =
                      "insert into `vote` (`imageID`, `voteDate`, `voteScore`) values (?, NOW(), ?)";
                    conn.query(
                      sql,
                      [imageID_1, rp1],
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
                      "update `vote` set `voteScore` = ? where `imageID` = ? and `voteDate` = CURDATE()";
                    conn.query(
                      sql,
                      [rp1, imageID_1],
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
              "select voteDate from vote where voteDate = CURDATE() and imageID = ? ",
              [result2[0].imageID],
              (error, result4) => {
                if (error) {
                  return res.status(500).json({
                    error: "An error occurred while fetching image2",
                  });
                } else {
                  if (result4.length == 0) {
                    const sql =
                      "insert into `vote` (`imageID`, `voteDate`, `voteScore`) values (?, NOW(), ?)";
                    conn.query(
                      sql,
                      [imageID_2, rp2],
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
                      "update `vote` set `voteScore` = ? where `imageID` = ?  and `voteDate` = CURDATE()";
                    conn.query(
                      sql,
                      [rp2, imageID_2],
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




router.get("/score/statistics/:id", async (req, res) => {
  try {
      const imageID = req.params.id;
      // หาวันที่ 7 วันที่ผ่านมา
      const lastSevenDays = new Date();
      lastSevenDays.setHours(0, 0, 0, 0); // ตั้งค่าเวลาเป็น 00:00:00
      lastSevenDays.setDate(lastSevenDays.getDate() - 7);

      console.log("Last seven days:", lastSevenDays);
      // ดึงข้อมูล Score ของรูปภาพที่ผู้ใช้มีส่วนร่วมในช่วง 7 วันที่ผ่านมา
      const query: string = `
                   SELECT image.imageID, image.uploadDate, image.voteCount ,image.imageURL ,image.imageName, user.userName,user.userID, vote.voteDate, vote.voteScore
                   FROM vote 
                   INNER JOIN image ON vote.imageID = image.imageID 
                   INNER JOIN user ON image.userID = user.userID
                   WHERE vote.voteDate >= ? AND image.imageID = ?
                   ORDER BY image.imageID, vote.voteDate`;
      conn.query(query, [lastSevenDays, imageID], (err: any, results: any) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Error fetching votes' });
          }
          // สร้างอาร์เรย์เพื่อเก็บผลลัพธ์ที่แยกตามรูปภาพ
          const imageStatistics: any[] = [];
          let currentImage: any = null;
          // ลูปผลลัพธ์ที่ได้จากคำสั่ง SQL
          for (const row of results) {
              // ถ้ารูปภาพปัจจุบันไม่มีข้อมูลหรือมี ID รูปภาพใหม่
              if (!currentImage || currentImage.imageID !== row.imageID) {
                  // สร้างข้อมูลรูปภาพใหม่
                  currentImage = {
                      imageID: row.imageID,
                      uploadDate: row.uploadDate,
                      voteCount: row.voteCount,
                      userName: row.userName,
                      userID: row.userID,
                      imageURL: row.imageURL,
                      imageName: row.imageName,
                      vote: [] // สร้างอาร์เรย์เพื่อเก็บข้อมูลของวันที่โหวตและคะแนน
                  };
                  // เพิ่มข้อมูลรูปภาพใหม่เข้าไปในอาร์เรย์
                  imageStatistics.push(currentImage);
              }
              // เพิ่มข้อมูลวันที่โหวตและคะแนนลงในอาร์เรย์ของรูปภาพปัจจุบัน
              currentImage.vote.push({ voteDate: row.voteDate, voteScore: row.voteScore });
          }
          // ส่งข้อมูลอาร์เรย์ที่ได้กลับไป
          res.json(imageStatistics);
      });
      
  } catch (error) {
      
      console.error("Error fetching image statistics:", error);
      res.status(500).json({ error: "Failed to fetch image statistics" });
  }
});


