import express from "express";
import myUserController from "../controllers/MyUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyUserRequest } from "../middleware/validation";

const router = express.Router();

// api/my/user
router.post("/", jwtCheck, myUserController.createCurrentUser); // create new user.
router.get("/",jwtCheck,jwtParse, myUserController.getCurrentUser);//get current user.
router.put(
  "/",
  jwtCheck,
  jwtParse,
  validateMyUserRequest,
  myUserController.updateCurrentUser
); // update current user.

export default router;
