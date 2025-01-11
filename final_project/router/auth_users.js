const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
console.log("Existing users:", users);
  return users.some(user => user.username === username);
};

const authenticatedUser = (username,password)=>{ 
return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  }  
  
   if (!isValid(username)) {
    return res.status(404).json({ message: "Username is not valid" });
  }
  
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Incorrect username or password" });
  } 
  

  const accessToken = jwt.sign({ username }, "access", {
      expiresIn: 60 * 60,});
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in." });

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const user = req.session.authorization.username;
  const review = req.body.review; // string
  const isbn = req.params.isbn;
  if (!review) {
    res.status(400).json({ message: "Review is empty!" });
  } else {
    books[isbn].reviews[user] = review;
    res.status(200).json({ message: "Book review updated." });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn; // Extract the ISBN from the URL
    const username = req.session.authorization?.username; // Extract username from session

    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the book has reviews
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found for the logged-in user" });
    }

    // Delete the review for the logged-in user
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while deleting the review" });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

