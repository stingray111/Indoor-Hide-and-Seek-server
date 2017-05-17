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
                UUID: req.body.uuid,
                locationLabel: 'undef'
            }]
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
            UUID: req.body.uuid,
            locationLabel: 'undef'
        });
        await data.save();
        res.send({success: true});
    } catch(err) {
        console.log(err);
        res.send({success: false, err: err});
    }
});

app.post('/getLocationLabelList', async function (req, res) {
    console.log(req.body);
    try {
        let data = await GameRoomData.findOne({_id: req.body.roomId});
        if (data === null)
            res.send(data.locations);
    } catch(err) {
        console.log(err);
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

app.post('/pushLocationLabel', async function (req, res) {
    try {
        let data = await GameRoomData.findOne({_id: req.body.roomId, 'locations.UUID': req.body.uuid});
        let target = data.locations.findIndex(function(ele) {
            return ele.UUID === req.body.uuid;
        });
        if (target !== -1) {
            data.locations[target].locationLabel = req.body.locationLabel;
            await data.save();
            res.send({success: true});
        } else {
            res.send({success: false})
        }
    } catch(err) {
        console.log(err);
        res.send({success: false});
    }

});

app.listen(3000);