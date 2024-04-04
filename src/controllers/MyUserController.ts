import { Request, Response } from "express";
import User from "../models/user";

const createCurrentUser = async (req: Request, res: Response) => {
  // 1. check if user exist
  // 2. create the user if it doesn't exist.
  // 3. return the user object to the calling client.

  try {
    console.log("api reached");
    const { auth0Id } = req.body; //get the auth0id form the user request body.
    const existingUser = await User.findOne({ auth0Id }); // get the user that has the particular auth0id.

    if (existingUser) {
      return res.status(200).send(); // if user exist just return.
    }

    // if no user is found in Db with given auth0id create a new user in our database.
    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json(newUser.toObject()); // to object convert mongo object into POJO
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const { name, addressLine1, country, city } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "user not" });
    }

    user.name = name;
    user.addressLine1 = addressLine1;
    user.country = country;
    user.city = city;

    await user.save();

    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findOne({ _id: req.userId });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(currentUser); // return user in json format.
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong while getting user" });
  }
};

export default {
  createCurrentUser,
  updateCurrentUser,
  getCurrentUser,
};
