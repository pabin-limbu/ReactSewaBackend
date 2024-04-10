import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

// menuItem schema will be seperate but will be embaded in resturant Schema. this will create seperate ids for menu item which call help while checkout.

const restaurantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restaurantName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  cuisines: [{ type: String, required: true }],
  menuItems: [menuItemSchema],
  imageUrl: { type: String, required: true },
  lastUpdated: { type: Date, required: true },
});

// ref means we are referencing to User document who is creating a resturant. it will create a link with user.
// cusines will be an array of string.

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
