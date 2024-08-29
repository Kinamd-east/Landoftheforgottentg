const mongoose = require('mongoose');

const TapSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        unique: true, 
        required: true 
    },
    tapCount: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

const Tap = mongoose.model('Tap', TapSchema);

module.exports = Tap;