const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username,password)=>{ //returns boolean
return users.some(
    (user) => user.username === username && user.password === password
  );
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  } else if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Incorrect username or password" });
  } else {
    const accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const user = req.session.authorization.username;
  const review = req.body.review; 
  const isbn = req.params.isbn;
  if (!review) {
    res.status(400).json({ message: "No Reviews" });
  } else {
    books[isbn].reviews[user] = review;
    res.status(200).json({ message: "Book reviewed." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const user = req.session.authorization.username;
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    res.status(400).json({ message: "not an ISBN." });
  } else if (!books[isbn].reviews[user]) {
    res
      .status(400)
      .json({ message: "Not reviewed."});
  } else {
    delete books[isbn].reviews[user];
    res.status(200).json({ message: "Review deleted." });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

