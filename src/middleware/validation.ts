// put all the validation logic here.

import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

const handleVlidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    // if any error in request.
    return res.status(400).json({ errors: error.array() });
  }
  next();
};

//Inside the function, it calls `validationResult(req)` to check if there are any validation errors based on the
// defined validation rules (e.g., checking if the "name", "addressLine1", "city", and "country" fields are strings
// and not empty as per the previous validation rules)

export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be string"),
  body("addressLine1")
    .isString()
    .notEmpty()
    .withMessage("AddressLine1 must be string"),
  body("city").isString().notEmpty().withMessage("City must be string"),
  body("country").isString().notEmpty().withMessage("country must be string"),
  handleVlidationErrors,
];

//This line defines a validation rule for the "name" field, checking that it is a string and not empty.
// If the validation fails, it will add an error message "Name must be string" to the validation errors.

/*
apply handleValidateErrors middleware to the bottom of validateMyUserRequest middleware, 
whenever a req is received to update user profile the express validatior will check the req based on
the things we have defined in the validateMyUserRequest array ,
*/
