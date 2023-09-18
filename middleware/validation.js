const { query } = require("express-validator");
const { body } = require("express-validator");

const authvalidator = {
  signUp: [
    body("name")
      .exists()
      .withMessage("Name was not provided")
      .bail()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .bail()
      .isString()
      .withMessage("Name must be a string")
      .isLength({ max: 30 })
      .withMessage("Name cannot be more than 30 characters"),
    body("email.id")
      .exists()
      .withMessage("Email was not provided")
      .bail()
      .notEmpty()
      .withMessage("Email cannot be empty")
      .bail()
      .isString()
      .withMessage("Email must be a string")
      .bail()
      .isEmail()
      .withMessage("Email must be a valid email"),
    body("email.status")
      .not()
      .exists()
      .withMessage("Email status can not be provided"),
    body("address")
      .exists()
      .withMessage("Address was not provided")
      .bail()
      .notEmpty()
      .withMessage("Address cannot be empty")
      .bail()
      .isString()
      .withMessage("Address must be a string")
      .isLength({ max: 30 })
      .withMessage("Address cannot be more than 30 characters"),
    body("password")
      .exists()
      .withMessage("Password was not provided")
      .bail()
      .notEmpty()
      .withMessage("Password cannot be empty")
      .bail()
      .isString()
      .withMessage("Password must be a string")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .bail()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter,one number and one special character"
      ),
    body("cpassword")
      .exists()
      .withMessage("Confirm Password was not provided")
      .bail()
      .notEmpty()
      .withMessage("Confirm Password cannot be empty")
      .bail()
      .isString()
      .withMessage("Confirm Password must be a string")
      .isLength({ min: 8 })
      .withMessage("Confirm Password must be at least 8 characters")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Confirm Password does not match Password");
        }
        return true;
      }),
  ],
  login: [
    body("email")
      .exists()
      .withMessage("Invalid Credential")
      .bail()
      .notEmpty()
      .withMessage("Invalid Credential")
      .bail()
      .isString()
      .withMessage("Invalid Credential")
      .bail()
      .isEmail()
      .withMessage("Invalid Credential"),
    body("password")
      .exists()
      .withMessage("Invalid Credential")
      .bail()
      .notEmpty()
      .withMessage("Invalid Credential")
      .bail()
      .isString()
      .withMessage("Invalid Credential"),
  ],
};

const cartValidator = {
  add: [
    body("book")
      .exists()
      .withMessage("Book was not provided")
      .bail()
      .notEmpty()
      .withMessage("Book cannot be empty")
      .bail()
      .isString()
      .withMessage("Book must be a string")
      .bail()
      .isMongoId()
      .withMessage("Book must be a valid mongo id"),
    body("quantity")
      .exists()
      .withMessage("Quantity was not provided")
      .bail()
      .notEmpty()
      .withMessage("Quantity cannot be empty")
      .bail()
      .isNumeric()
      .withMessage("Quantity must be a number")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive number")
      .bail()
      .isLength({ max: 10 })
      .withMessage("Too long input"),
  ],
};

const reviewValidator = {
  add: [
    body("book")
      .exists()
      .withMessage("Book was not provided")
      .bail()
      .notEmpty()
      .withMessage("Book cannot be empty")
      .bail()
      .isString()
      .withMessage("Book must be a string")
      .bail()
      .isMongoId()
      .withMessage("Book must be a valid mongo id"),
    body("rating")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Review cannot be empty")
      .bail()
      .isNumeric()
      .withMessage("Rating must be a number")
      .bail()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be an Integer number between 1 and 5"),
    body("review")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Review cannot be empty")
      .bail()
      .isString()
      .withMessage("Review must be a string")
      .bail()
      .isLength({ max: 100 })
      .withMessage("Review cannot be more than 100 characters"),
  ],
};

const userValidator = {
  update: [
    body("name")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .bail()
      .isString()
      .withMessage("Name must be a string")
      .isLength({ max: 30 })
      .withMessage("Name cannot be more than 30 characters"),
    body("address")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Address cannot be empty")
      .bail()
      .isString()
      .withMessage("Address must be a string")
      .isLength({ max: 30 })
      .withMessage("Address cannot be more than 30 characters"),
  ],
};

const bookValidator = {
  add: [
    body("name")
      .exists()
      .withMessage("Name was not provided")
      .bail()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .bail()
      .isString()
      .withMessage("Name must be a string")
      .bail()
      .isLength({ max: 30 })
      .withMessage("Name cannot be more than 30 characters"),

    body("price")
      .exists()
      .withMessage("Price was not provided")
      .bail()
      .isNumeric()
      .withMessage("Price must be a number")
      .bail()
      .isFloat({ min: 0 })
      .withMessage("Price cannot be negative"),

    body("stock")
      .exists()
      .withMessage("Stock was not provided")
      .bail()
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),

    body("author")
      .exists()
      .withMessage("Author was not provided")
      .bail()
      .notEmpty()
      .withMessage("Author cannot be empty")
      .bail()
      .isString()
      .withMessage("Author must be a string"),

    body("genre")
      .exists()
      .withMessage("Genre was not provided")
      .bail()
      .notEmpty()
      .withMessage("Genre cannot be empty")
      .bail()
      .isString()
      .withMessage("Genre must be a string"),

    body("publisher")
      .exists()
      .withMessage("Publisher was not provided")
      .bail()
      .notEmpty()
      .withMessage("Publisher cannot be empty")
      .bail()
      .isString()
      .withMessage("Publisher must be a string"),

    body("isbn")
      .exists()
      .withMessage("ISBN was not provided")
      .bail()
      .notEmpty()
      .withMessage("ISBN cannot be empty")
      .bail()
      .isString()
      .withMessage("ISBN must be a string")
      .bail()
      .matches(/^[0-9]{3}-[0-9]{1}-[0-9]{2}-[0-9]{6}-[0-9]{1}$/)
      .withMessage("Invalid ISBN format"),

    body("pages")
      .exists()
      .withMessage("Pages were not provided")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Pages must be a positive integer"),

    body("language")
      .exists()
      .withMessage("Language was not provided")
      .bail()
      .notEmpty()
      .withMessage("Language cannot be empty")
      .bail()
      .isString()
      .withMessage("Language must be a string"),
  ],
  update: [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .bail()
      .isString()
      .withMessage("Name must be a string")
      .bail()
      .isLength({ max: 30 })
      .withMessage("Name cannot be more than 30 characters"),

    body("price")
      .optional()
      .notEmpty()
      .withMessage("Price cannot be empty")
      .bail()
      .isNumeric()
      .withMessage("Price must be a number")
      .bail()
      .isFloat({ min: 0 })
      .withMessage("Price cannot be negative"),

    body("stock")
      .optional()
      .notEmpty()
      .withMessage("Stock cannot be empty")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Stock must be a non-negative integer or greater than zero"),

    body("author")
      .optional()
      .notEmpty()
      .withMessage("Author cannot be empty")
      .bail()
      .isString()
      .withMessage("Author must be a string"),

    body("genre")
      .optional()
      .notEmpty()
      .withMessage("Genre cannot be empty")
      .bail()
      .isString()
      .withMessage("Genre must be a string"),

    body("publisher")
      .optional()
      .notEmpty()
      .withMessage("Publisher cannot be empty")
      .bail()
      .isString()
      .withMessage("Publisher must be a string"),

    body("isbn")
      .optional()
      .notEmpty()
      .withMessage("ISBN cannot be empty")
      .bail()
      .isString()
      .withMessage("ISBN must be a string")
      .bail()
      .matches(/^[0-9]{3}-[0-9]{1}-[0-9]{2}-[0-9]{6}-[0-9]{1}$/)
      .withMessage("Invalid ISBN format"),

    body("pages")
      .optional()
      .notEmpty()
      .withMessage("Pages cannot be empty")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Pages must be a positive integer"),

    body("language")
      .optional()
      .notEmpty()
      .withMessage("Language cannot be empty")
      .bail()
      .isString()
      .withMessage("Language must be a string"),
  ],
};
const balanceValidator = {
  add: [
    body("amount")
      .exists()
      .withMessage("Amount was not provided")
      .bail()
      .isNumeric()
      .withMessage("Amount must be a number")
      .bail()
      .isFloat({ min: 1 })
      .withMessage("Amount cannot be negative or zero")
      .bail()
      .isFloat({ max: 100000 })
      .withMessage("Amount cannot be more than 100k")
      .bail()
      .isLength({ max: 10 })
      .withMessage("Too long input"),
  ],
};

const discountValidator = {
  add: [
    body("description")
      .exists()
      .withMessage("Description was not provided")
      .bail()
      .notEmpty()
      .withMessage("Description cannot be empty")
      .bail()
      .isString()
      .withMessage("Description must be a string")
      .bail()
      .isLength({ max: 30 })
      .withMessage("Description cannot be more than 30 characters"),
    body("percentage")
      .exists()
      .withMessage("Percentage was not provided")
      .bail()
      .isNumeric()
      .withMessage("Percentage must be a number")
      .bail()
      .isFloat({ min: 1, max: 99 })
      .withMessage("Percentage must be between 1 and 100"),
    body("eligibleRoles")
      .exists()
      .withMessage("Eligible Roles was not provided")
      .bail()
      .notEmpty()
      .withMessage("Eligible Roles cannot be empty")
      .bail()
      .isArray()
      .withMessage("Eligible Roles must be an array")
      .bail()
      .isIn(["premium_user", "user"])
      .withMessage("Eligible Roles must be either admin or user")
      .bail()
      .custom((value) => {
        if (value.length === 0) {
          throw new Error("Eligible Roles must contain at least one role");
        }
        return true;
      }),
    body("eligibleCountries")
      .exists()
      .withMessage("Eligible Countries was not provided")
      .bail()
      .notEmpty()
      .withMessage("Eligible Countries cannot be empty")
      .bail()
      .isArray()
      .withMessage("Eligible Countries must be an array")
      .bail()
      .custom((value) => {
        if (value.length === 0) {
          throw new Error(
            "Eligible Countries must contain at least one country"
          );
        }
        return true;
      }),
    body("startDate")
      .exists()
      .withMessage("Start Date was not provided")
      .bail()
      .notEmpty()
      .withMessage("Start Date cannot be empty")
      .bail()
      .isDate()
      .withMessage("Start Date must be a date"),
    body("endDate")
      .exists()
      .withMessage("End Date was not provided")
      .bail()
      .notEmpty()
      .withMessage("End Date cannot be empty")
      .bail()
      .isDate()
      .withMessage("End Date must be a date"),
    body("books")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Books cannot be empty")
      .bail()
      .isArray()
      .withMessage("Books must be an array")
      .bail()
      .custom((value) => {
        if (value.length === 0) {
          throw new Error("Books must contain at least one book");
        }
        return true;
      }),
  ],
  addConstraint: [
    body("book")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Books cannot be empty")
      .bail()
      .isString()
      .withMessage("Book must be a string")
      .bail()
      .isMongoId()
      .withMessage("Book must be a valid mongo id"),
    body("eligibleRoles")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Eligible Roles cannot be empty")
      .bail()
      .isLength({ max: 30 })
      .withMessage("Eligible Roles cannot be more than 30 characters")
      .custom((value) => {
        if (value != "user" || value != "premium_user") {
          throw new Error("Eligible Roles must be either premium_user or user");
        }
      }),
    body("eligibleCountries")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Eligible Countries cannot be empty")
      .bail()
      .isLength({ max: 30 })
      .withMessage("Eligible Countries cannot be more than 30 characters"),
  ],
  update: [
    body("description")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Description cannot be empty")
      .bail()
      .isString()
      .withMessage("Description must be a string")
      .bail()
      .isLength({ max: 30 })
      .withMessage("Description cannot be more than 30 characters"),
    body("percentage")
      .optional()
      .bail()
      .isNumeric()
      .withMessage("Percentage must be a number")
      .bail()
      .isFloat({ min: 1, max: 99 })
      .withMessage("Percentage must be between 1 and 100"),
    body("eligibleRoles")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Eligible Roles cannot be empty")
      .bail()
      .isArray()
      .withMessage("Eligible Roles must be an array")
      .bail()
      .isIn(["premium_user", "user"])
      .withMessage("Eligible Roles must be either admin or user")
      .bail()
      .custom((value) => {
        if (value.length === 0) {
          throw new Error("Eligible Roles must contain at least one role");
        }
        return true;
      }),
    body("eligibleCountries")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Eligible Countries cannot be empty")
      .bail()
      .isArray()
      .withMessage("Eligible Countries must be an array")
      .bail()
      .custom((value) => {
        if (value.length === 0) {
          throw new Error(
            "Eligible Countries must contain at least one country"
          );
        }
        return true;
      }),
    body("startDate")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Start Date cannot be empty")
      .bail()
      .isDate()
      .withMessage("Start Date must be a date"),
    body("endDate")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("End Date cannot be empty")
      .bail()
      .isDate()
      .withMessage("End Date must be a date"),
    body("books")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Books cannot be empty")
      .bail()
      .isArray()
      .withMessage("Books must be an array")
      .bail()
      .custom((value) => {
        if (value.length === 0) {
          throw new Error("Books must contain at least one book");
        }
        return true;
      }),
  ],
};

const filterValiator = {
  filter: [
    query("Limit")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Limit cannot be empty")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer"),
    query("Page")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Page cannot be empty")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("SortBy")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("SortBy cannot be empty")
      .bail()
      .isString()
      .withMessage("SortBy must be a string")
      .bail()
      .isIn([
        "name",
        "stock",
        "price",
        "author",
        "genre",
        "publisher",
        "isbn",
        "pages",
        "language",
      ])
      .withMessage(
        "SortBy must be one of the following: name, price,stock,author, genre, publisher, isbn, pages, language"
      ),
    query("SortByType")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("SortByType cannot be empty")
      .bail()
      .isString()
      .withMessage("SortByType must be a string")
      .bail()
      .isIn(["asc", "desc"])
      .withMessage("SortByType must be either asc or desc"),
    query("Search")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Search cannot be empty")
      .bail()
      .isString()
      .withMessage("Search must be a string"),
    query("Name")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    query("Author")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Author cannot be empty"),
    query("Genre")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Genre cannot be empty"),
    query("Publisher")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Publisher cannot be empty"),
    query("isbn")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("isbn cannot be empty"),
    query("Language")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Language cannot be empty"),
    query("Stock")
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Stock cannot be empty")
      .bail()
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
    query("Price")  
      .optional()
      .bail()
      .notEmpty()
      .withMessage("Price cannot be empty")
      .bail()
      .isInt({ min: 0 })
      .withMessage("Price must be a non-negative integer"),
    query("PriceOperator")
        
      .optional()
      .bail()
      .notEmpty()
      .withMessage("PriceOperator cannot be empty")
      .bail()
      .isIn(["gt", "gte", "eq", "lte", "lt"])
      .withMessage(
        "PriceOperator must be one of the following: gt, gte, eq, lte, lt"
      ),
  ],
};
module.exports = {
  authvalidator,
  cartValidator,
  reviewValidator,
  userValidator,
  bookValidator,
  balanceValidator,
  discountValidator,
  filterValiator,
};
