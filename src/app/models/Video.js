import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    channel: {
        type: String,
        required: true,
    },
   video: {
    type: String,
    required: true,
   }
}, {timestamps: true})

const Video = mongoose.models.Video || mongoose.model("Video", VideoSchema);

export default Video;