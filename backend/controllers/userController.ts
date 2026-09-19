import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import Session from "../models/Session.js";
import { Resume } from "../models/Resume.js";
import { Gamification } from "../models/Gamification.js";
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

    // Save refresh token in database
    await RefreshToken.create({
        userId: id,
        token: refreshTokenString,
        expiresAt,
    });

    const isProduction = process.env.NODE_ENV === "production";

    // Set Access Token in HttpOnly Cookie
    res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set Refresh Token in HttpOnly Cookie
    res.cookie("refreshToken", refreshTokenString, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

/**
 * @desc Register a new user
 * @route POST /api/user/register
 * @access Public
 */
const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

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
        await generateTokenInCookie(res, user._id.toString());
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            preferredRole: user.preferredRole,
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

/**
 * @desc Authenticate a user & get token
 * @route POST /api/user/login
 * @access Public
 */
const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        await generateTokenInCookie(res, user._id.toString());
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            preferredRole: user.preferredRole,
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

/**
 * @desc Authenticate with Google
 * @route POST /api/user/google
 * @access Public
 */
const googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    const payload = await verifyFirebaseToken(token);

    if (!payload || !payload.email) {
        res.status(400);
        throw new Error("Invalid Google token");
    }

    const { email, name, uid } = payload;

    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            name: name || "Google User",
            email,
            googleId: uid,
        });
    } else if (!user.googleId) {
        user.googleId = uid;
        await user.save();
    }

    await generateTokenInCookie(res, user._id.toString());

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredRole: user.preferredRole,
    });
});

/**
 * @desc Get user profile
 * @route GET /api/user/profile
 * @access Private
 */
const getUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            preferredRole: user.preferredRole,
            xp: user.xp,
            currentLevel: user.currentLevel,
            streakDays: user.streakDays,
            createdAt: user.createdAt,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

/**
 * @desc Update user profile
 * @route PUT /api/user/profile
 * @access Private
 */
const updateUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.preferredRole = req.body.preferredRole || user.preferredRole;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            preferredRole: updatedUser.preferredRole,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

/**
 * @desc Refresh access token using refresh token cookie
 * @route POST /api/user/refresh
 * @access Public
 */
const refreshUserToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshTokenString = req.cookies.refreshToken;

    if (!refreshTokenString) {
        res.status(401);
        throw new Error("No refresh token provided");
    }

    const savedToken = await RefreshToken.findOne({ token: refreshTokenString });

    if (!savedToken || savedToken.expiresAt < new Date()) {
        res.status(403);
        throw new Error("Refresh token expired or invalid");
    }

    const user = await User.findById(savedToken.userId);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Generate new Access Token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is not defined");

    const newAccessToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "15m" });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", newAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({ message: "Token refreshed successfully" });
});

/**
 * @desc Logout user and clear cookies
 * @route POST /api/user/logout
 * @access Private
 */
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const refreshTokenString = req.cookies.refreshToken;

    if (refreshTokenString) {
        await RefreshToken.deleteOne({ token: refreshTokenString });
    }

    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.cookie("refreshToken", "", {
        httpOnly: true,
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

    const rawRecentSessions = await Session.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "name email");

    const recentSessions = rawRecentSessions.map((session) => {
        const obj = session.toObject();
        return {
            ...obj,
            userId: obj.user,
        };
    });

    res.status(200).json({
        totalUsers,
        totalSessions,
        totalResumes,
        completedSessions,
        recentSessions,
    });
});

/**
 * @desc Get single user detailed profile and stats (Admin only).
 * @route GET /api/user/admin/users/:id
 * @access Private/Admin
 */
const getUserDetailsForAdmin = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const [gamification, totalSessions, completedSessions, recentSessions, totalResumes, recentResumes] = await Promise.all([
        Gamification.findOne({ user: user._id }),
        Session.countDocuments({ user: user._id }),
        Session.countDocuments({ user: user._id, status: { $in: ["completed", "reviewed"] } }),
        Session.find({ user: user._id }).sort({ createdAt: -1 }).limit(5),
        Resume.countDocuments({ user: user._id }),
        Resume.find({ user: user._id }).sort({ createdAt: -1 }).limit(5),
    ]);

    res.status(200).json({
        user,
        gamification,
        stats: {
            totalSessions,
            completedSessions,
            totalResumes,
        },
        recentSessions,
        recentResumes,
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
    getUserDetailsForAdmin,
};
