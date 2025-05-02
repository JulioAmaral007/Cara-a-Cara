const mongoose = require('mongoose')

const GameSchema = new mongoose.Schema({
    player1: {
        type: String, 
        required: true
    },
    player2: {
        type: String, 
        required: true
    },
    characters: {
        type: Object, 
        required: true
    },
    isActive: {
        type: Boolean, 
        default: true
    },
    winner: {
        type: String, 
        default: null
    }
}, 
{
    timestamps: true
});

module.exports = mongoose.model('Game', GameSchema);