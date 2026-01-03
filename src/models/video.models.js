import mongoose, {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const video = new Schema(
    {
        videofile: {
            type: String, // cloudnary url
            required: [true, "Video file is required"],
        },
        thumbnail: {
            type: String, // cloudnary url
            required: [true, "Thumbnail is required"],
        },
        title: {
            type: String, 
            required: [true, "Title is required"],
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    }, {timestamps: true}
)

video.plugin(mongooseAggregatePaginate);


export const Video = mongoose.model('Video', video); 