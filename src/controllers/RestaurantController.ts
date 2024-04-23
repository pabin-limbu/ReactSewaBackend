import { Request, Response } from "express";
import Restaurant from "../models/restaurant";

const getRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.restaurantId;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "something went wrong while getting restaurant" });
  }
};

const searchRestaurants = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;
    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    let query: any = {};

    query["city"] = new RegExp(city, "i"); // the i flag means case insensitive.

    const cityCheck = await Restaurant.countDocuments(query);

    if (cityCheck === 0) {
      console.log("no city found");
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    // if city match.
    if (selectedCuisines) {
      const cuisineArray = selectedCuisines
        .split(",")
        .map((cuisine) => new RegExp(cuisine, "i"));

      // it will look like : query{cuisines: { $all: [/Italian/i, /Japanese/i] }}
      // all operator means all cuisines in array must match in order for the document to match.
      query["cuisines"] = { $all: cuisineArray }; //$all helps you find documents where an array field contains all specified values
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { restaurantName: searchRegex },
        { cuisines: { $in: [searchRegex] } },
      ];
    }

    console.log(query);

    const pageSize = 10;
    const skip = (page - 1) * pageSize; // how many of the record to skip in the search result to skip based on the page and the page size.
    //if we are on page 2 -> 2-1 = 1 , 1*10 = 10, so skip first 10 result to get to second page, since user has selected page 2.

    //sort option can be dynamic, ex sortOption = last updated.
    const restaurants = await Restaurant.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    //to determine how many total page should be gor the search result.
    const total = await Restaurant.countDocuments(query);
    const response = {
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize), //50 result , page size = 10 > pages will be five.
      },
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "sometihng went wrong while searching restaurant" });
  }
};

export default { searchRestaurants, getRestaurant };
