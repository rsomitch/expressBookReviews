const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    return users.some((user) => user.username === username);
  };

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(404).json({ message: "Please provide your Username and Password" });
    } else if (doesExist(username)) {
      return res.status(404).json({ message: "Username not available" });
    } else {
      users.push({ username: username, password: password });
      return res.status(200).json({message: "You are now registered. Please login to continue." });
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const bookISBN = parseInt(req.params.isbn);
  const selectedBook = books[bookISBN];
  if (!selectedBook) {
    return res.status(404).json({ message: "ISBN is not available." });
  } else { 
  return res.status(200).json(books[bookISBN]);
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const bookAuthor = Object.values(books).filter(
        (book) => book.author.toLowerCase() === req.params.author.toLowerCase()
      );
      if (bookAuthor.length > 0) {
        return res.status(200).send(JSON.stringify(bookAuthor, null, 4));
      } else {
        return res.status(404).json({ message: "Author is not available." });
      }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const bookTitle = Object.values(books).filter(
        (book) => book.title.toLowerCase() === req.params.title.toLowerCase()
      );
      if (bookTitle.length > 0) {
        return res.status(200).send(JSON.stringify(bookTitle, null, 4));
      } else {
        return res.status(404).json({ message: "Title is not available." });
      }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const bookISBN = req.params.isbn;
    const selectedBook = books[bookISBN];
    if (selectedBook) {
      return res.status(200).send(JSON.stringify(selectedBook.reviews, null, 4));
    } else {
      return res.status(404).json({ message: "No Reviews Available" });
    }
});

module.exports.general = public_users;
