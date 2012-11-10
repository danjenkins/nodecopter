var Ami = require('asterisk-ami');
var events = require('events').EventEmitter;
var util = require('util');
var config = require('./config');
var ar_drone = require('ar-drone');
var client = ar_drone.createClient();

util.inherits(Nodecopter, events);

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
  switch(config[command]) {
    case 'land' :
      console.log('landing drone...');
      client.after(1000, function() {
        client.stop();
        client.land();
      });
      break;
    case 'takeoff':
      console.log('taking off...');
      client.takeoff();
  }
};

//client
//  .after(3000, function() {
//    this.clockwise(0.5);
//  })
//  .after(3000, function() {
//    this.animate('flipLeft', 15);
//  })
//  .after(1000, function() {
//    this.stop();
//    this.land();
//  });
//
//client.createRepl();

