import express from 'express';
import {GameRoomData} from './db';
import bodyParser from 'body-parser';

let app = express();

app.use(bodyParser.json());

app.post('/createRoom', async function (req, res) {
    console.log(req.body);
    let data = new GameRoomData({
        locations: [{
                playerName: req.body.playerName,
                uuid: req.body.uuid,
                locationLabel: 'undef'
            }],
        victim: req.body.uuid
    });
    let savedData = await data.save();
    res.send({roomId: savedData._id});
});

app.post('/joinRoom', async function (req, res) {
    console.log(req.body);
    try {
        let data = await GameRoomData.findOne({_id: req.body.roomId});
        data.locations.push({
            playerName: req.body.playerName,
            uuid: req.body.uuid,
            locationLabel: 'undef'
        });
        await data.save();
        res.send({success: true});
    } catch(err) {
        console.log(err);
        res.send({success: false, err: err});
    }
});

app.post('/quitRoom', async function (req, res) {
    console.log(req.body);
    try {
        let data = await GameRoomData.findOne({_id: req.body.roomId, 'locations.uuid': req.body.uuid});
        let target = data.locations.findIndex(function(ele) {
            return ele.uuid === req.body.uuid;
        });
        if (target !== -1) {
            data.locations[target].remove();
            console.log(data.locations);
            await data.save();
            res.send({success: true});
        } else {
            res.send({success: false})
        }
    } catch(err) {
        console.log(err);
        res.send({success: false, err: err});
    }
});

app.post('/startGame', async function (req, res) {
    console.log(req.body);
    try {
        let data = await GameRoomData.findOne({_id: req.body.roomId});
        res.send({success: true, playerList: data.locations});
    } catch(err) {
        console.log(err);
        res.send({success: false})
    }
});

app.post('/gameStartCheck', async function (req, res) {
    console.log(req.body);
    try {
        let data = await GameRoomData.findOne({_id: req.body.roomId});
        res.send({victim: data.victim, playerList: data.locations});
    } catch(err) {
        console.log(err);
    }
});

app.post('/endGame', async function (req, res) {
    console.log(req.body);
    try {
        let data = await GameRoomData.findOne({_id: req.body.roomId});
        data.gameEnd = true;
        await data.save();
        res.send({success: true});
    } catch(err) {
        console.log(err);
        res.send({success: true})
    }
});

app.post('/getLocationLabelList', async function (req, res) {
    console.log(req.body);
    try {
        let data = await GameRoomData.findOne({_id: req.body.roomId});
        if (data !== null)
            res.send({gameEnd: data.gameEnd, locationList: data.locations});
    } catch(err) {
        console.log(err);
    }
});

app.post('/pushLocationLabel', async function (req, res) {
    try {
        let data = await GameRoomData.findOne({_id: req.body.roomId, 'locations.UUID': req.body.uuid});
        if (data.gameEnd) {
            res.send({success: true, gameEnd: true});
            return;
        }
        let target = data.locations.findIndex(function(ele) {
            return ele.uuid === req.body.uuid;
        });
        if (target !== -1) {
            data.locations[target].locationLabel = req.body.locationLabel;
            await data.save();
            res.send({success: true, gameEnd: false});
        } else {
            res.send({success: false, gameEnd: false})
        }
    } catch(err) {
        console.log(err);
        res.send({success: false, gameEnd: false});
    }

});

app.post('/locationLabelExchange', async (req, res) => {
    try {
        let data = await GameRoomData.findOne({_id: req.body.roomId, 'locations.uuid': req.body.uuid});
        if (data.gameEnd) {
            res.send({success: true, gameEnd: true});
            return;
        }
        let target = data.locations.findIndex(function(ele) {
            return ele.uuid === req.body.uuid;
        });
        if (target !== -1) {
            data.locations[target].locationLabel = req.body.locationLabel;
            data = await data.save();
            res.send({
                success: true,
                gameEnd: data.gameEnd,
                locationList: data.locations
            });
        } else {
            res.send({success: false})
        }
    } catch(err) {
        console.log(err);
        res.send({success: false});
    }
});

app.listen(3000);