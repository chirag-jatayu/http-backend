import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({

    subscriber: {
        type: mongoose.Schema.Types.ObjectId, // one who is subscribing
        ref: "Users"
    },
    channel: {
        type: mongoose.Schema.Type.ObjectId,// one to whom "subscriber "is subscribing
        ref: "Users"
    }
}, { timestamps: true })

export const Subscription = new mongoose.model("Subscription", subscriptionSchema)