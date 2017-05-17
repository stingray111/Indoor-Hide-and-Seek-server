import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
let Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

let connection = mongoose.createConnection('localhost:27017');
autoIncrement.initialize(connection);

let gameRoomSchema = new Schema({
    date: {type: Date, require: true, default: Date.now},
    locations: [{
        playerName: {type: String, require: true},
        UUID: {type: String, require: true},
        locationLabel: {type: String, require: true}
    }]
});

gameRoomSchema.plugin(autoIncrement.plugin, 'gameRoom');

// Construct MongoDB models
let GameRoomData = connection.model('gameRoom', gameRoomSchema);

export {GameRoomData};