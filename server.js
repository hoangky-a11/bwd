const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'bi-mat',
    resave: false,
    saveUninitialized: true
}));

// Kết nối database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // chỉnh lại nếu MySQL có mật khẩu
  database: 'webhue'
});

db.connect(err => {
  if (err) throw err;
  console.log('Đã kết nối database');
});

// Xử lý đăng ký
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hash], (err, result) => {
      if (err) {
        res.send('Email đã tồn tại!');
      } else {
        res.send('Đăng ký thành công! <a href="login.html">Đăng nhập</a>');
      }
    });
  });
});

// Xử lý đăng nhập
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      res.send('Email không tồn tại');
    } else {
      const user = results[0];
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          req.session.user = user;
          res.send(`Đăng nhập thành công! Xin chào ${user.username}`);
        } else {
          res.send('Mật khẩu không đúng');
        }
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});
