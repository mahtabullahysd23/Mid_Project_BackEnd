# Online Book Store Management System

This is a REST API-based Online Book Store Management System implemented using Node.js, Express.js, and MongoDB. The system provides functionalities for both regular users and administrators, including authentication, book browsing, cart management, user profile management, and more.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [API Documentation](#api-documentation)
- [Usage](#usage)
  - [User Guide](#user-guide)
  - [Administrator Guide](#administrator-guide)
- [Contributing](#contributing)

## Features

### Common Functionality
- User authentication and authorization with JWT.
- View all available books.
- Filter, sort, paginate, and search for books.
- Server-side logging for system events.

### User Functionality
- User registration.
- View books in the cart.
- View transaction history.
- Add and remove books from the cart.
- Rate and review books.
- Avail discounts on eligible books.
- Checkout books from the cart, reducing book stock and deducting balance.

### Administrator Functionality
- View transaction history of all users.
- View and manage user data.
- Edit user information.
- Delete user accounts.
- Manage book data (add, edit, delete).
- Apply discounts to books for a limited time.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JSON Web Tokens (JWT)

## Getting Started

### Prerequisites

Before running the project, ensure you have the following installed:

- Node.js (with npm)
- MongoDB
- Postman (for API testing)

### Installation

1. Clone this GitHub repository:

   ```bash
   https://github.com/mahtabullahysd23/Mid_Project_BackEnd.git
2. Install dependencies:
   ```bash
   npm install
3. Configure the environment variables:
  Create a .env file in the root directory and configure the following variables:
   ```bash
   PORT=8000           
   DB_URL=mongodb://localhost/bookstore  
   SECRET_KEY=mysecretkey
   EMAIL_ID=""
   EMAIL_PASSWORD=""
4. Start the server:
   ```bash
   npm run start  
Your server should now be running on http://localhost:8000.

## API Documentation

Refer to the [[API Specification Document](https://docs.google.com/spreadsheets/d/1P7AWSqYFZNZfQTSwQz5TeoSmOz43VRnW87oevfENYF4/edit?usp=sharing)] for detailed information about the API endpoints, inputs, and outputs.

## Usage

### User Guide

#### User Registration
- Sign up for a new account.

#### Browse Books
- View all available books.
- Filter, sort, paginate, or search for specific books.

#### Cart Management
- View books in your cart.
- Add books to the cart individually.
- Remove books from the cart individually.
- Proceed to checkout to purchase books.

#### Rating and Review
- Rate and review books.

#### Discounts
- Avail discounts on eligible books.

#### Transaction History
- View your transaction history.
- Check your balance and update it if needed.

### Administrator Guide

#### User Management
- View all user data.
- Edit existing user information.
- Delete user accounts.

#### Book Management
- Add new books to the system.
- Edit book data individually.
- Delete existing books.

#### Discount Management
- Add discounts for books with limited-time availability.
- Update discounts for books.

#### Transaction History
- View transaction history of all users.

## Contributing

Contributions to this project are welcome. Feel free to open issues and submit pull requests to improve the system.
