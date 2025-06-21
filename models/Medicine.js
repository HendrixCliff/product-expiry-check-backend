const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    imagePath: {
        type: String
    },
    pushSubscription: {
        type: Object
    },
    email: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', MedicineSchema);
