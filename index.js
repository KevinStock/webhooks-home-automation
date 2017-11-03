var express = require('express'),
  request = require('request'),
  multer = require('multer');

var app = express();
var upload = multer({
  dest: '/tmp/'
});

// Apple TVs
var atvLivingRoom = '73E643FA-7653-4D77-977E-44859DFDF491';
var atvBedroom = '18114917-2071-4486-BDFF-0B87897A8655';
// LIFX Bulb Groups
var lifxLivingRoomGroupID = '258662f1abbffed5d7410280860b9eef';
var lifxBedroomGroupID = '93cfa6a8b2266c52e55e5c7c18b3ac44';

app.post('/', upload.single('thumb'), function(req, res, next) {
  var payload = JSON.parse(req.body.payload);
  console.log('Got webhook for', payload.event);

  var mediaTitle = payload.Metadata.grandparentTitle;
  var color = "white";
  switch (mediaTitle) {
    case "24: Legacy":
      color = "blue";
      break;
    case "Z Nation":
      color = "red";
      break;
    default:
      color = "white";
  }
  console.log(payload.Player.uuid);
  // Apple TVs
  if ((payload.Player.uuid == atvLivingRoom || payload.Player.uuid == atvBedroom) && payload.Metadata.type != 'track') {
    var light_group;
    if (payload.Player.uuid == atvLivingRoom) {
      light_group = lifxLivingRoomGroupID;
    }
    else if (payload.Player.uuid == atvBedroom) {
      light_group = lifxBedroomGroupID;
    }
    var options = {
      method: 'PUT',
      json: true,
      url: 'https://api.lifx.com/v1/lights/group_id:' + light_group + '/state',
      headers: {
        'Authorization': 'Bearer cf0e8fe481e9e7ab2a3f113f7030b7f37b0bd62c3d191a22e5d829438d0c048c'
      }
    };
  
    if (payload.event == 'media.play' || payload.event == 'media.resume') {
      // Turn light off.
      console.log('Turning light off.');
      options.body = {
        "power": "off",
        "color": color
      }
      request(options);
      
    } else if (payload.event == 'media.pause' || payload.event == 'media.stop') {
      // Turn light on.
      console.log('Turning light on.');
      options.body = {
        "power": "on",
        "color": color
      }
      request(options);
    }
  }

  res.sendStatus(200);
});

app.listen(3100);
