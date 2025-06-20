import mongoose, {Schema, Document, Types} from "mongoose";

export interface IToken extends Document {
    token: string,
    user: Types.ObjectId,
    createdAt: Date
}

const tokemSchema : Schema = new Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        type: Types.ObjectId,
        ref: 'User'
    },
    expiresAt: {
        type: Date,
        default: Date.now(),
        expires: "10m"
    }
})

const token = mongoose.model<IToken>('Token', tokemSchema)
export default token