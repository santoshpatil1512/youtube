
import mongoose, { Schema }  from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoName:{type:String,required:true},//cloudinary url
        thumbnail:{type: String, required:true },//cloudinary url
        title:{type: String, required:true},
        description:{type:Number, required:true},
        views:{typer: Number, default:0},
        isPublished:{type:Boolean, default:true},
        duration:{type:Number, default:0},
        owner:{type: Schema.Types.ObjectId, ref: "User"},
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate);

export const Video  = mongoose.model("Video", videoSchema)