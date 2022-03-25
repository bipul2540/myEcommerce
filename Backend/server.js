const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const mysql = require("mysql2");

const cookieParser = require("cookie-parser");
const sessions = require("express-session");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  sessions({
    key: "userId",
    secret:
      "b327e3316f5c82c3b7aa5bb379e23ec42f238b1a0f6dfcfcda9f6fa4b8d23a557999cc4bf78a2bbf6aefa2a21b90458d86c41ad3993df621a38eb635c453d1d1",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "project_1",
});

// for registraing users

app.post("/register", (req, res) => {
  const username = req.body.username;
  const phone = req.body.phone;
  const email = req.body.email;
  const confirmEmail = req.body.confirmEmail;
  const password = req.body.password;

  db.query(
    "INSERT INTO register (username, phone, email, confirmEmail, password) VALUE (?, ?, ?, ?,?);",
    [username, phone, email, confirmEmail, password],
    (err, result) => {
      res.send({ message: "succusfully registerd", err: err });
      console.log(err);
    }
  );
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.execute(
    "SELECT * FROM register WHERE email = ? AND password = ?",
    [email, password],
    (err, result) => {
      if (err) {
        res.send(err);
      }
      if (result.length > 0) {
        req.session.user = result;
        res.send(result);
      } else {
        res.send({ messages: "wrong username/password" });
      }
    }
  );
});

// ADD PRODUCT
app.post("/addproduct", (req, res) => {
  const title = req.body.title;
  const price = req.body.price;
  const ratings = req.body.ratings;
  const image = req.body.image;
  const header = req.body.header;
  console.log(req.body);

  db.query(
    "INSERT INTO addproduct (title, price, ratings, image, header) VALUE (?, ?, ?, ?, ?)",
    [title, price, ratings, image, header],
    (err, result) => {
      res.send({ messages: "sucussfully added product", err: err });
      console.log(err);
    }
  );
});

// getting product from database;

app.get("/getProducts", (req, res) => {
  db.query("SELECT * FROM addproduct;", (err, results) => {
    res.send(results);
  });
});

// DELETING PRODUCT FROM PAGE

app.delete("/deleteItem/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);

  db.query(
    "DELETE FROM addproduct WHERE idaddProduct = ?;",
    [id],
    (err, result) => {
      res.send({ messagea: "item deleted succesfully" });
      console.log(err);
    }
  );
});

// adding shipping address and product item in the database for delivering of the item

app.post("/shippingitem", (req, res) => {
  const name = req.body.name;
  const phone = req.body.number;
  const pincode = req.body.pincode;
  const area = req.body.area;
  const address = req.body.fullAddress;
  const city = req.body.city;
  const state = req.body.state;
  const totalAmount = req.body.totalAmountPaid;
  const item = req.body.item;

  const query =
    "INSERT INTO shippingaddress (name, phone, pincode, address, area, city, state, totalAmount, item) VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [name, phone, pincode, address, area, city, state, totalAmount, item],
    (err, results) => {
      if (err) {
        console.log("error is :", err);
        res.send("error in sending the data");
      } else {
        res.send(results);
      }
    }
  );
});

// get shipping details in the admin pane

app.get("/details/shippingitem", (req, res) => {
  db.query("SELECT * FROM shippingaddress", (err, results) => {
    res.send(results);
  });
});

// deleting order form database ;

app.delete("/shippingitems/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "DELETE FROM shippingaddress WHERE idShippingAddress = ?;",
    [id],
    (err, result) => {
      res.send(result);
    }
  );
});

app.listen(3001, () => {
  console.log("running on port 3001");
});
