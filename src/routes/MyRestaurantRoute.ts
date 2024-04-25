// This route belong only to the logedin user.

import express from "express";
import multer from "multer";
import MyRestaurantController from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import {
  validateMyRestaurantRequest,
  validateMyUserRequest,
} from "../middleware/validation";
const router = express.Router();

//multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb 1024 times 1025 is 1mb.
  },
});

router.get(
  "/order",
  jwtCheck,
  jwtParse,
  MyRestaurantController.getMyRestaurantOrders
);

router.get("/", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant);

router.put(
  "/",
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  MyRestaurantController.updateMyRestaurant
);

router.patch("/order/:orderId/status",jwtCheck,jwtParse,MyRestaurantController.updateOrderStatus)


// /api/my/resturant
router.post(
  "/",
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  MyRestaurantController.createMyRestaurant
);
// it is crucial to think which middleware to run first as it runs in order.
//upload. single will get the image file form the req body and save it in memory- storage define above.
// this middleware will add the file in req body and send it to controller.

export default router;
