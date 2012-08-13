if (!(process.argv[2] && process.argv[3])){
  console.error('usage: "name" "id"');
  process.exit();
}

var name = process.argv[2]
, id = process.argv[3];

var redis = require('redis').createClient();
var key = 'axis:notable:'+id;

redis.hmset(key, {name:name,id:id}, function(){
  redis.hgetall(key, function(e, data){
    console.log(data);
    process.exit();
  });
});
