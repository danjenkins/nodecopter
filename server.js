var Ami = require('asterisk-ami');
var events = require('events').EventEmitter;
var util = require('util');
var config = require('./config');

function Nodecopter() {
  var self = this;
  this.ami = new Ami({ host: '172.16.172.133', username: 'astricon', password: 'secret' });
  this.ami.on('ami_data', function(data){
    if(data.event){
      self.emit(data.event, data);
    }  
  });
  
}

util.inherits(Nodecopter, events);

Nodecopter.prototype.ami_connect = function(cb) {
  this.ami.connect(cb);
};

Nodecopter.prototype.ami_send = function(data) {
  this.ami.send(data);
};


var nodecopter = new Nodecopter();

nodecopter.on('AsyncAGI', function(data){
  var self = this;
  console.log(data);
  if(data.subevent == 'Start'){
    self.ami_send({
      action:'AGI',
      channel: data.channel,
      command: 'GET DATA beep 3000 1'
    })
  }
})

nodecopter.ami_connect(function(){
  console.log('ami connected');
});


var ar_drone = require('ar-drone');
var client = ar_drone.createClient();

//client.takeoff();
//
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

client.createRepl();

