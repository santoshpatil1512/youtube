import mongoose, { Schema }  from "mongoose";

const userSchema = new Schema(
    {
        username:{ type: String, required: true, index:true, nique: true, trim: true, lowercase: true }, 
        email:{type: String, required: true, unique: true, trim: true, lowercase: true }, 
        fulName:{ type: String, required: true, trim: true, index: true }, 
        password:{ type: String, required: [true, 'Password is required']}, 
        avatar:{ type: String,required: true}, // cloudinary url
        coverImage:{ type: String}, // cloudinary url
        watchHistory:{ type: Schema.Types.ObjectId, ref: "Video"}, 
        refreshToken:{ type: String}
    },
    {
        timestamps: true
    }
)

export const User = mongoose.model("User", userSchema)