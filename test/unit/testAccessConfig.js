var assert = require('assert');
var test = require('utest');
var config = require('../../config');

test('Cache req', {
  'return commands' : function() {
    console.log(config);
    assert.ok(config['1'] === 'land');
    assert.ok(config['*'] === 'up');
  }
});
