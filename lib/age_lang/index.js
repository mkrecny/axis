var redis = require('redis').createClient();
var computeScore = require('../compute_score');
var roundNumber = require('../round_number');


function getAvgArray(map){
  var a = [];
  Object.keys(map).forEach(function(key){
    a.push([key, roundNumber(map[key].sum/map[key].count,2), 
    roundNumber(map[key].age/map[key].age_count, 2), map[key].count]);
  });
  return a;
}

module.exports = function(compare_to, cb){
  redis.keys('axis:result:*', function(e, keys){
    var multi = redis.multi();
    keys.forEach(function(key){
      multi.hgetall(key);
    });
    var map = {};
    multi.exec(function(e, results){
      results.forEach(function(r){
        if (r[compare_to]){
          if (map.hasOwnProperty(r[compare_to])){
            map[r[compare_to]].sum += +computeScore(r).liberalism;
            map[r[compare_to]].count += 1;
            map[r[compare_to]].age += r.age/1 || 0;
            map[r[compare_to]].age_count += ((r.age/1)/(r.age/1))||0;
          } else {
            map[r[compare_to]] = {
              sum: +Math.floor(computeScore(r).liberalism), 
              count: 1,
              age: (r.age/1 || 0),
              age_count: ((r.age/1)/(r.age/1))||0
            };
          }
        }
      });
      return cb(e, getAvgArray(map));
    });
  });
};
