const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{username:"Joao Massuia",password:"1234567"}]; //contains registered users

const isValid = (username)=>{ //returns boolean
    return username && 
    username.length >= 4 && 
    /^[a-zA-Z0-9_]+$/.test(username);
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    return users.some(user => 
        user.username === username && 
        user.password === password
    );
};

regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
        // Extract isbn parameter from request URL
        const isbn = req.params.isbn;
        const reviewText = req.query.review;  // Retrieve books object associated with isbn
        const username = req.session.authorization?.username;

        // Respond if book with specified isbn is not found
        if (!books[isbn]) {
            return res.status(404).json({message: "Unable to find book!"});
        }

        // Input validation
        if (!isbn || !reviewText){
            return res.status(400).json({ 
                message: "ISBN and review query parameter are required" 
            });
        }

        // Respond if not logged in
        if (!username) {
            return res.status(403).json({message: "Must be logged in to review"});
        }

        // Initialize reviews object if it doesn't exist
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }

        // Add/update review (stores with username as key)
        books[isbn].reviews[username] = reviewText;

        return res.status(200).json({
            message: `Review ${books[isbn].reviews[username] ? 'updated' : 'added'} successfully`,
            book: {
                isbn: isbn,
                title: books[isbn].title,
                your_review: reviewText
            }
        });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username; 

    // Input validation
    if (!isbn){
        return res.status(400).json({ 
            message: "ISBN is required." 
        });
    }

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({message: "Unable to find book!"});
    }

    // Check if not logged in
    if (!username) {
        return res.status(403).json({message: "Must be logged in to delete review"});
    }
    
    // Initialize reviews if they don't exist
    books[isbn].reviews = books[isbn].reviews || {};

    // Check if user has a review for this book
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({message: "You have no review for this book!"});
    }
    
    // Delete friend from 'books' object based on provided isbn and user session
    delete books[isbn].reviews[username];
    
    return res.status(200).json({
        message: "Review deleted successfully",
        book: {
            isbn: isbn,
            title: books[isbn].title,
            remaining_reviews: books[isbn].reviews
        }
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;