import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import Session from "../models/Session.js";
import { Resume } from "../models/Resume.js";
import { verifyFirebaseToken } from "../config/firebase.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { RefreshToken } from "../models/RefreshToken.js";

// Augment Express Request interface to include the user
import { AuthenticatedRequest } from "../types/express.js";

/**
 * Generates a JWT access token and a refresh token, saves the refresh token to DB,
 * and sets them as HttpOnly cookies in the response.
 * @param {Response} res - Express response object.
 * @param {string} id - User ID to sign the token for.
 */
const generateTokenInCookie = async (res: Response, id: string) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is not defined");

    // Short-lived access token
    const accessToken = jwt.sign({ id }, jwtSecret, { expiresIn: "15m" });

    // Long-lived refresh token
    const refreshTokenString = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
        userId: id,
        token: refreshTokenString,
        expiresAt,
    });

    res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
        maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refresh_jwt", refreshTokenString, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

/**
 * @desc Register a new user with name, email, and password.
 * @route POST /api/user/register
 * @access Public
 */
const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please provide all fields");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        await generateTokenInCookie(res, (user._id as any).toString());
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            preferredRole: user.preferredRole,
            role: user.role,
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

/**
 * @desc Authenticate user and get token.
 * @route POST /api/user/login
 * @access Public
 */
const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("Please provide all fields");
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        await generateTokenInCookie(res, (user._id as any).toString());
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            preferredRole: user.preferredRole,
            role: user.role,
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

/**
 * @desc Google Login / Registration via Firebase Auth.
 * Receives a Firebase ID Token from the frontend (after the user signs in
 * with Google through Firebase Auth), verifies it with Firebase Admin SDK,
 * then finds or creates the user in MongoDB and issues our own JWT session.
 * @route POST /api/user/google
 * @access Public
 */
const googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    if (!token) {
        res.status(400);
        throw new Error("Please provide Firebase ID token");
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
        decodedToken = await verifyFirebaseToken(token);
    } catch (err) {
        res.status(401);
        throw new Error("Invalid or expired Firebase token");
    }

    const { uid: firebaseUid, email, name, email_verified } = decodedToken;

    if (!email_verified || !email) {
        res.status(400);
        throw new Error("Email not verified");
    }

    let user: any = await User.findOne({ email });

    if (user) {
        // Update firebaseUid if not set yet (e.g. user previously registered by email)
        if (!user.googleId) {
            user.googleId = firebaseUid;
            await user.save();
        }
        await generateTokenInCookie(res, (user._id as any).toString());
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            preferredRole: user.preferredRole,
            role: user.role,
        });
    } else {
        // New user — create account from Firebase profile
        user = await User.create({
            name: name ?? email.split("@")[0],
            email,
            googleId: firebaseUid,
        });

        if (user) {
            await generateTokenInCookie(res, (user._id as any).toString());
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                preferredRole: user.preferredRole,
                role: user.role,
            });
        } else {
            res.status(400);
            throw new Error("Failed to create user");
        }
    }
});

/**
 * @desc Get user profile data.
 * @route GET /api/user/profile
 * @access Private
 */
const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user) {
        res.status(200).json({
            _id: authReq.user._id || authReq.user.id,
            name: authReq.user.name,
            email: authReq.user.email,
            preferredRole: authReq.user.preferredRole,
            role: authReq.user.role,
        });
    } else {
        res.status(401);
        throw new Error("User not found");
    }
});

/**
 * @desc Update user profile data.
 * @route PUT /api/user/profile
 * @access Private
 */
const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user) {
        const user = await User.findById(authReq.user._id || authReq.user.id);
        if (!user) {
            res.status(401);
            throw new Error("User not found");
        }

        if (req.body?.email && req.body.email !== user.email) {
            const emailTaken = await User.findOne({ email: req.body.email });
            if (emailTaken) {
                res.status(400);
                throw new Error("Email is already in use");
            }
            user.email = req.body.email;
        }

        user.name = req.body?.name || user.name;
        user.preferredRole = req.body?.preferredRole || user.preferredRole;

        if (req.body?.password) {
            user.password = req.body.password;
        }

        await user.save();
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            preferredRole: user.preferredRole,
            role: user.role,
        });
    } else {
        res.status(401);
        throw new Error("User not found");
    }
});

/**
 * @desc Refresh access token using refresh token.
 * @route POST /api/user/refresh
 * @access Public
 */
const refreshUserToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refresh_jwt;

    if (!incomingRefreshToken) {
        res.status(401);
        throw new Error("Refresh token not found");
    }

    // Validate refresh token in DB
    const storedToken = await RefreshToken.findOne({ token: incomingRefreshToken });

    if (!storedToken) {
        // Token was not found. For security, we just clear the cookies.
        res.cookie("jwt", "", { maxAge: 0 });
        res.cookie("refresh_jwt", "", { maxAge: 0 });
        res.status(401);
        throw new Error("Invalid refresh token");
    }

    // Token exists, is it expired?
    if (new Date() > storedToken.expiresAt) {
        await RefreshToken.deleteOne({ _id: storedToken._id });
        res.cookie("jwt", "", { maxAge: 0 });
        res.cookie("refresh_jwt", "", { maxAge: 0 });
        res.status(401);
        throw new Error("Refresh token expired");
    }

    // Valid. Delete the old refresh token (rotation) and issue a new pair
    await RefreshToken.deleteOne({ _id: storedToken._id });

    // Generate new pair
    await generateTokenInCookie(res, storedToken.userId.toString());

    res.status(200).json({ message: "Token refreshed successfully" });
});

/**
 * @desc Logout user by clearing HTTP-only JWT cookie.
 * @route POST /api/user/logout
 * @access Private
 */
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refresh_jwt;
    if (incomingRefreshToken) {
        // Remove token from database to prevent reuse
        await RefreshToken.deleteOne({ token: incomingRefreshToken });
    }

    res.cookie("jwt", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
        expires: new Date(0),
    });

    res.cookie("refresh_jwt", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
        expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
});

/**
 * @desc Get all users (Admin only).
 * @route GET /api/user/admin/users
 * @access Private/Admin
 */
const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
});

/**
 * @desc Update user role (Admin only).
 * @route PATCH /api/user/admin/users/:id/role
 * @access Private/Admin
 */
const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.body;
    if (!role || !["user", "admin"].includes(role)) {
        res.status(400);
        throw new Error("Invalid role specified. Must be 'user' or 'admin'");
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    user.role = role;
    await user.save();

    res.status(200).json({
        message: `User role updated to ${role}`,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});

/**
 * @desc Get system statistics and recent interview sessions (Admin only).
 * @route GET /api/user/admin/stats
 * @access Private/Admin
 */
const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
    const totalUsers = await User.countDocuments({});
    const totalSessions = await Session.countDocuments({});
    const totalResumes = await Resume.countDocuments({});
    const completedSessions = await Session.countDocuments({
        status: { $in: ["completed", "reviewed"] }
    });

    const recentSessions = await Session.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "name email");

    res.status(200).json({
        totalUsers,
        totalSessions,
        totalResumes,
        completedSessions,
        recentSessions,
    });
});

export {
    registerUser,
    loginUser,
    googleLogin,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    refreshUserToken,
    getAllUsers,
    updateUserRole,
    getAdminStats,
};
