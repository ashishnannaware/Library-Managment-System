# Library Management System API


## Setup

Git clone the repository

Inside library_db folder contain bson file import all that to in your local mongoDB
Command: mongorestore --db library_db <path to library_db folder>

Install deps: npm install

Create .env file:
  MONGODB_URI=mongodb://localhost:27017/library_db
  PORT=3000
  Optional email: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE

Run dev: npm run dev

Run prod: npm start

## Core Behavior
Books CRUD with Joi validation and duplicate ISBN checks
Pagination and filtering on list endpoints
Text search by title/author
Soft delete (audit trail) for books
Async wishlist notifications when a book returns to Available (non-blocking response)

## Endpoints

GET  /server-status — service status

Books:
POST /api/books — create book

GET  /api/books — list books (pagination, author, publishedYear filters)

GET  /api/books/search — partial match on title/author

GET  /api/books/:id — get book by id

PUT  /api/books/:id — update book (includes availabilityStatus)

DELETE /api/books/:id — soft delete book

Users:

POST /api/users — create user

GET  /api/users — list users (pagination, userName, email filters)

GET  /api/users/userId/:userId — get user by userId

GET  /api/users/:id — get user by id

PUT  /api/users/:id — update user

DELETE /api/users/:id — soft delete user

Wishlist:

GET  /api/wishlist — get all wishlist (pagination, userId, bookId filters)

POST /api/wishlist — add book to wishlist (requires userId, bookId)

GET  /api/wishlist/check — check if book is in wishlist (query params: userId, 
bookId)

GET  /api/wishlist/user/:userId — get user's wishlist with book details

DELETE /api/wishlist/user/:userId/book/:bookId — remove book from wishlist

## Soft Delete
Implemented via utils/softDelete.js plugin (deletedAt, softDelete(), restore(), query helper notDeleted).

## Async Notifications
On book status change Borrowed to Available, triggerWishlistNotifications runs in the background (setImmediate):
  Finds wishlisters for the book
  Logs/sends notification for each without delaying the API response

## Validation (Joi)
Request validation lives in middleware (bookValidator.js, userValidator.js, wishlistValidator.js) for bodies and queries; controllers add duplicate checks and clear status codes.

