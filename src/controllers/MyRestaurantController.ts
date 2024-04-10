import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json(restaurant);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error while fetching restaurant" });
  }
};

const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    // user can only create one restaurant, so check if user has created already or not.
    const existingRestaurant = await Restaurant.findOne({ user: req.userId });

    if (existingRestaurant) {
      return res.status(409).json({ message: "user restaurant already exist" });
    }

    // create uri string that represent image.
    const image = req.file as Express.Multer.File; // this file is forwarded by the multer middleware from the routes.

    const base64Image = Buffer.from(image.buffer).toString("base64"); // convert the image to base64 String.

    const dataURI = `data:${image.mimetype};base64,${base64Image}`; // mime type is type of image.

    //`dataURI` will contain the image data in a base64-encoded format along with the MIME type, which could be used for displaying the image in browsers, embedding it in HTML, or storing it in a database as a base64-encoded string.

    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = uploadResponse.url;
    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();
    await restaurant.save();

    res.status(201).send(restaurant);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "something went wrong while creating restaurant" });
  }
};

const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }

    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();
    res.status(200).send(restaurant);
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({ message: "something went wrong while updating" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  // create uri string that represent image.
  const image = file as Express.Multer.File; // this file is forwarded by the multer middleware from the routes.

  const base64Image = Buffer.from(image.buffer).toString("base64"); // convert the image to base64 String.

  const dataURI = `data:${image.mimetype};base64,${base64Image}`; // mime type is type of image.

  //`dataURI` will contain the image data in a base64-encoded format along with the MIME type, which could be used for displaying the image in browsers, embedding it in HTML, or storing it in a database as a base64-encoded string.
  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default {
  createMyRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
};
