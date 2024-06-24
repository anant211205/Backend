import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type : Schema.Types.ObjectId ,
        ref : "User" // one who is subscripbing
    },
    channel:{
        type : Schema.Types.ObjectId , //channel is also a user
        ref : "User" 
    }
} , {timestamps:true}); 

export const Subscription = mongoose.model("Subscription" , subscriptionSchema)