import express from "express";
import { param } from "express-validator";
import RestaurantController from "../controllers/RestaurantController";

const router = express.Router();

// anything after the search/ will be the city variable.
// example : /api/restaurant/search/hongkong
router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City Parameter must be a valid String"),
  RestaurantController.searchRestaurants
);

export default router;
