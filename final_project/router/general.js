const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", (req,res) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status().json({messag:"User name and password must be entered."});
     }
    users.push({username, password});
    return res.status(201).json({
    message: "User successfully registered.", user: { username }});  
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    new Promise((resolve)=>{
        resolve(books)
    })
    .then(books =>{
        res.json(books);
    })
    .catch(error =>{
        console.log("Error: ", error);
    })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    new Promise((resolve) => {
        const isbn = req.params.isbn;
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject(new Error("Book not found."));
        }
    })
    .then(book => {
        res.json(book)
    })
    .catch(error => {
        res.status(404).json({message: error.message});
    })
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    new Promise((resolve) => {
        const author = req.params.author;
;       const matchingBooks = [];

        for (const key in books) {
            const firstName = books[key].author.split(' ')[0];
            if (firstName === author) {
                matchingBooks.push(books[key]);
            }
        }
        resolve(matchingBooks);    
    })
    .then(books => {
        if (books.length > 0) {
            res.json(books);
        } else {
            res.status(404).json({ message: "No books found for this author."});
        }
    })
    .catch(error => {
        console.error("Error:", error);
        res.status(500).json({message: "Internal server error."});
    })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    new Promise((resolve) => {
        const title = req.params.title;
        const matchingBooks = [];
        for (const key in books) {
            if (books[key].title === title) {
                matchingBooks.push(books[key]);
            }
        }
        resolve(matchingBooks);
    })
    .then(books => {
        if (books.length > 0) {
            res.json(books);
        } else {
            res.status(404).json({ message: "No books found for this title."});
        }
    })
    .catch(error => {
        res.status(500).json({message: "Internal server error."});
    })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const reviews = books[isbn].reviews;

    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }

       if (Object.keys(reviews).length > 0) {
        res.json(reviews);
    } else {
        res.status(404).json({ message: "No reviews found for this book." });
    }
});

module.exports.general = public_users;
