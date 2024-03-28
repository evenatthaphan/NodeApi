import express from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";
import { UserPostRequest } from "../model/data_post_request";

//create router of this API
export const router = express.Router();

router.get("/", async (req, res) => {
  const sql = "select * from user";
  conn.query(sql, (err, result) => {
    res.status(200);
    res.json(result);
    console.log(JSON.stringify(result));
  });
  // res.send("Method GET in index.ts");
});


//get login
router.get("/login", async (req, res) => {
  const email = req.query.email;
  const password = req.query.password;
  const sql = "SELECT * FROM user WHERE email = ? AND password = ?";
  conn.query(sql, [email, password], (err, result) => {
    res.json(result);
  });
});


//post register
router.post("/", (req, res) => {
  let User: UserPostRequest = req.body;
  const sql =
    "INSERT INTO user (username, email , password, avatar) VALUES (?, ? , ?,'https://i.pinimg.com/564x/a8/0e/36/a80e3690318c08114011145fdcfa3ddb.jpg')";
  conn.query(sql, [User.username, User.email, User.password], (err, result) => {
    if (err) {
      console.error("Error inserting user:", err);
      res.status(500).json({ error: "Error inserting user" });
    } else {
      res.status(201).json({ affected_row: result.affectedRows });
    }
  });
});


//edit profile
router.put("/edit:id", async (req, res) => {
  //1. Receive data from request
  const id = +req.params.id;
  let user: UserPostRequest = req.body;

  //2. Query original data by id
  let userOriginal: UserPostRequest | undefined;
  let sql = mysql.format("select * from user where userID =? ", [id]);
  let result = await queryAsync(sql);
  const jsonStr = JSON.stringify(result);
  const jsonObj = JSON.parse(jsonStr);
  const rawData = jsonObj;
  userOriginal = rawData[0];

  //3. Merge received object to original
  const updataUser = { ...userOriginal, ...user };

  //4. update data in tabel
  sql =
    "update  `user` set `username`=?, `email`=?, `password`=?, `avatar`=?, `position`=? where `userID`=?";
  sql = mysql.format(sql, [
    updataUser.username,
    updataUser.email,
    updataUser.password,
    updataUser.avatar,
    updataUser.position,
    id,
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).json({ affected_row: result.affectedRows });
  });
});



router.get("/list", async (req, res) => {
  const sql = "select * from user where position = 1";
  conn.query(sql, (err, result) => {
    res.status(200);
    res.json(result);
    console.log(JSON.stringify(result));
  });
});


router.get("/getuserprofile:userID", async (req, res) => {
  const id = +req.params.userID;
  let user: UserPostRequest = req.body;
  const sql = "select * from user where userID = ?";
  conn.query(sql, (err, result) => {
    res.status(200);
    res.json(result);
    console.log(JSON.stringify(result));
  });
});


router.get('/checkUploads/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // ส่งคำสั่ง SQL query เพื่อดึงข้อมูลรูปภาพทั้งหมดของผู้ใช้งานคนนี้
    const sql = `SELECT * FROM image WHERE userID = ?`;
    conn.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Error querying database.' });
      }

      // ตรวจสอบจำนวนรูปภาพที่ผู้ใช้งานคนนี้ได้อัปโหลดแล้ว
      if (results.length >= 5) {
        // หากมีรูปภาพมากกว่าหรือเท่ากับ 5 รูป ให้ส่งข้อความว่างั้นไม่สามารถอัปโหลดรูปภาพเพิ่มได้
        return res.status(403).json({ message: 'Cannot upload more than 5 images.' });
      }

      // หากยังไม่ถึง 5 รูป ให้ส่งข้อความว่ายังสามารถอัปโหลดรูปภาพได้อีก
      return res.status(200).json({ message: 'You can still upload images.' });
    });
  } catch (error) {
    console.error('Error checking upload status:', error);
    return res.status(500).json({ error: 'Error checking upload status.' });
  }
});