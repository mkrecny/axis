var redis = require('redis').createClient();
var computeScore = require('../compute_score');


module.exports = function(compare_to, cb){
  var out = [];
  redis.keys('axis:result:*', function(e, keys){
    var multi = redis.multi();
    keys.forEach(function(key){
      multi.hgetall(key);
    });
    multi.exec(function(e, results){
      results.forEach(function(r){
        if (r[compare_to]){
          out.push([r[compare_to], Math.floor(computeScore(r).liberalism)]);
        }
      });
      return cb(e, out);
    });
  });
};
