//this function is for validating auth0 user session. created using auth0/application/api
//the identifier are provided in the api of auth0
//  iauserbaseurl is  the url of the auth0 api.
// use this middleware in the route to check if api request has valid token or not.

import { auth } from "express-oauth2-jwt-bearer";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

// if we want to add custom property to express req object this is the way, without this there will be a type script error.
declare global {
  namespace Express {
    interface Request {
      userId: string;
      auth0Id: string;
    }
  }
}

//create api credential in auth0 which lets us check the token.
//application and api are different in auth0
// this api credentials are used to validate token provided by auth0.
// the instalation process are shown in oauth apie credentials .
export const jwtCheck = auth({
  audience: process.env.AUtH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});
//for above function auth has implemented next funciton.



export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
//get the token , slplit it and take the token.
//decode the token.
//after decoding it will give auth0Id .
// use auth0 id to get user.
//pass user id req object.

  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.sendStatus(401); // unauthorized
  }
  const token = authorization.split(" ")[1];
  // install jsonweb token and types json web token.
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const auth0Id = decoded.sub; // sb is convention in auth0 that hold auth0 id
    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.sendStatus(401);
    }

    //appending some info to the user req param.
    req.auth0Id = auth0Id as string;
    req.userId = user._id.toString();
    next(); // gets passed in as params by express and tells that we are done with the middleware .
  } catch (error) {
    return res.sendStatus(401);
  }
};

