var Ami = require('asterisk-ami');
var events = require('events').EventEmitter;
var util = require('util');
var config = require('./config');
var ar_drone = require('ar-drone');
var client = ar_drone.createClient();

util.inherits(Nodecopter, events);

var upcount = 0;
var downcount = 0;
var rightcount = 0;
var leftcount = 0;
var clockwisecount = 0
var counterclockwisecount = 0;

var nodecopter = new Nodecopter();

function Nodecopter() {
  var self = this;
  this.ami = new Ami({ host: '192.168.15.101', username: 'nodecopter', password: 'secret' });
  this.ami.on('ami_data', function(data){
    if(data.event){
      self.emit(data.event, data);
    }  
  });
  
}

Nodecopter.prototype.ami_connect = function(cb) {
  this.ami.connect(cb);
};

Nodecopter.prototype.ami_send = function(data) {
  this.ami.send(data);
};

Nodecopter.prototype.decode_agi_env = function(data){
  var str = decodeURIComponent(data);
  str = str.substring(0,str.length - 2);
  str = str.replace(/:\s/g, "\":\"");
  str = str.replace(/\n/g,"\",\"");
  str = str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  str = '{"' + str + '"}';
  return JSON.parse(str);
}

Nodecopter.prototype.decode_agi = function(data){
  var str = decodeURIComponent(data);
  str = str.substring(0,str.length - 1);
  var arr = /(\d+)\sresult=(.+)/.exec(str);
  //BODGE!!!!
  if(arr == null){
    arr = Array();
    arr[1] = '200';
    arr[2] = '#';
  }
  var obj = {
    code: arr[1],
    result: arr[2]
  }
  return obj;
}

nodecopter.on('AsyncAGI', function(data){
  var self = this;
  if(data.result){
    data.result = nodecopter.decode_agi(data.result);
  }
  if(data.env){
    data.env = nodecopter.decode_agi_env(data.env);
  }
  console.log(data);
  if(data.result) {
    data.result.code == '200' ? self.commandControl(data.result.result) : console.error('Sorry, didn\'t get that');
    self.amiSend(data);
  }

  if(data.subevent == 'Start'){
    self.amiSend(data);
  }
});

Nodecopter.prototype.amiSend = function(data) {
  this.ami_send({
    action:'AGI',
    channel: data.channel,
    command: 'GET DATA beep 30000000000000 1'
  });
}

nodecopter.ami_connect(function(){
  console.log('ami connected');
});

Nodecopter.prototype.commandControl = function(command) {
  if(config[command] != 'down'){
    downcount = 0;
  }
  if(config[command] != 'up'){
    upcount = 0;
  }

  switch(config[command]) {
    case 'land' :
      console.log('landing drone...');
      client.stop();
      client.land();
      break;
    case 'takeoff':
      console.log('taking off...');
      client.takeoff();
      break;
    case 'stop':
      console.log('Hovering hx-ardrone');
      client.stop();
      break;
    case 'up':
      upcount++;
      if(upcount < 10) {
        console.log('Current upward speed = 0.'+upcount);
        client.up(upcount/10);
      } else {
        client.up(1);
        console.log('Warning: reached upward max speed...');
      }
      break;
    case 'down':
      downcount++;
      if(downcount < 10) {
        console.log('Current downward speed = 0.'+downcount);
        client.down(downcount/10);
      } else {
        console.log('Warning: reached downward max speed...');
        client.down(1);
      }
      break;
    case 'left':
      console.log('banking left...');
      leftcount++;
      if(leftcount < 10) {
        console.log('Current left speed = 0.'+leftcount);
        client.left(leftcount/10);
      } else {
        console.log('Warning: reached left max speed...');
        client.left(1);
      }
      break;
    case 'right':
      console.log('banking right...');
      rightcount++;
      if(rightcount < 10) {
        console.log('Current left speed = 0.'+rightcount);
        client.right(rightcount/10);
      } else {
        console.log('Warning: reached right max speed...');
        client.right(1);
      }
      break;
    case 'clockwise':
      console.log('turning right...');
      clockwisecount++;
      if(clockwisecount < 10) {
        console.log('Current right speed = 0.'+clockwisecount);
        client.clockwise(clockwisecount/10);
      } else {
        console.log('Warning: reached right max speed...');
        client.clockwise(1);
      }
      break;
    case 'counterclockwise':
      console.log('turning right...');
      counterclockwisecount++;
      if(counterclockwisecount < 10) {
        console.log('Current left speed = 0.'+counterclockwisecount);
        client.counterClockwise(counterclockwise/10);
      } else {
        console.log('Warning: reached left max speed...');
        client.counterClockwise(1);
      }
      break;
    case 'flip':
      console.log('flipping!!!');
      client.animate('flipAhead');
      break;
  }
};

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
  client.land();
});

