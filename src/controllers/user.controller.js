import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// util function to generate access and refresh tokens
const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } 
    catch (error) {
        throw new ApiError(500, "Somethomg went wrong while generating Access and Refresh Tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty fields
    // check if user already exists: username, email
    // check for images, avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password, refreshToken from response
    // check for user creation
    // return response

    // get user details
    const { fullname, email, username, password } = req.body
    // console.log(req.body);

    // validation - not empty fields
    if (
        [fullname, email, password, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existingUser) {
        throw new ApiError(409, "User already exists with this email or username")
    }

    // check for coverimages and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    } 

    // create user object
    const user = await User.create({
        fullname,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        password
    })

    // remove password, refreshToken from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) {
        throw new ApiError(500, "User creation failed")
    }
    console.log("Created user from DB:", createdUser);


    // return response
    res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
});

const loginUser = asyncHandler(async(req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token generation
    // send cookies
    // send response

    // get user details
    const {username, email, password} = req.body
    if(!username || !email){
        throw new ApiError(400, "Username or Email is required!!")
    }

    // check if user already exists
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if(!user){
        throw new ApiError(404, "User not Found")
    }
    
    // check the validaity of Password
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Password not found!!")
    }

    // access and refresh tokens
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    // remove password, refreshToken from response
    const loggedInUser = User.findById(user._id).select(-"password" -"refreshToken")

    // cookies
    const options = {
        httpOnly: true,
        secure: true
    }
    
    // send response
    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {user: loggedInUser, accessToken, refreshToken},
                    "User logged in Successfuly!!"
                ) 
            ) 
})

const logoutUser = asyncHandler(async(req, res) => {
    
})

export { registerUser, loginUser };