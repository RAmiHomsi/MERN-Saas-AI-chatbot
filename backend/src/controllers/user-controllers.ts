import { NextFunction, Request, Response } from "express";
import { hash, compare } from "bcrypt";
import { createToken } from "../utils/token-manager";
import User from "../models/User";
const COOKIE_NAME = "auth_token";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get all users
    const users = await User.find();
    return res.status(200).json({ message: "OK", users });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create a new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Create token
    const token = createToken(newUser._id.toString(), newUser.email, "7d");

    // Set cookie
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      expires,
      httpOnly: true,
      signed: true,
    });

    return res
      .status(201)
      .json({
        message: "User created successfully",
        name: newUser.name,
        email: newUser.email,
      });
  } catch (error) {
    console.error("Error during user signup:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if password is correct
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Create token and store cookie
    const token = createToken(user._id.toString(), user.email, "7d");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      expires,
      httpOnly: true,
      signed: true,
    });

    return res
      .status(200)
      .json({
        message: "Login successful",
        name: user.name,
        email: user.email,
      });
  } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user exists based on JWT data
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not registered or token malfunctioned" });
    }

    // Check if user ID matches with JWT data
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).json({ message: "User ID mismatch" });
    }

    // Return user data if verification successful
    return res
      .status(200)
      .json({ message: "User verified", name: user.name, email: user.email });
  } catch (error) {
    console.error("Error during user verification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const userLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user exists based on JWT data
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not registered or token malfunctioned" });
    }

    // Check if user ID matches with JWT data
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).json({ message: "User ID mismatch" });
    }

    // Clear the authentication cookie
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      signed: true,
      path: "/",
    });

    return res
      .status(200)
      .json({
        message: "User logged out successfully",
        name: user.name,
        email: user.email,
      });
  } catch (error) {
    console.error("Error during user logout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
