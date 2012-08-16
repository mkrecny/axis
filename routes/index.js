var beliefsDb = require('../data/beliefs')
, get_2d_avg = require('../lib/get_2d_avg')
, redis = require('redis').createClient()
, computeScore = require('../lib/compute_score')
, chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

//TODO: move all these helpers into their own files in /lib

function getRandomId(){ // clearly I am a liberal :p
  var id = '';
  for (var i=0;i<8;i++){
    id+= chars[Math.floor(Math.random()*(chars.length))];
  }
  return id;
}

function writeResult(id, data, cb){
  redis.hmset('axis:result:'+id , data, cb);
}

function readResult(id, cb){
  redis.hgetall('axis:result:'+id, cb);
}

function getNotables(cb){
  redis.keys('axis:notable:*', function(e, keys){
    var multi = redis.multi();
    keys.forEach(function(key){
      multi.hgetall(key);
    });
    multi.exec(cb);
  });
}

exports.index = function(req, res){
  res.render('index', { beliefs: beliefsDb, answers:false})
};

exports.age_vs_lib = function(req, res){
  get_2d_comparison('age', function(e, data){
    res.end(JSON.stringify(data));
  });
};

exports.age = function(req, res){
  get_2d_avg('age', function(e, data){
    res.render('age', {data:data});
  });
};

exports.result = function(req, res){
  readResult(req.params.id, function(e, data){
    var meta = {
      age : data.age,
      lang : data.lang,
      startup : data.startup 
    };
    delete data.age;
    delete data.lang;
    delete data.startup;
    getNotables(function(e, notables){
      res.render('results', { result_id : req.params.id, notables : notables, meta: meta, score: computeScore(data), beliefs: beliefsDb, answers: data })
    });
  });
};

exports.submit = function(req, res){
  var result_id = getRandomId();
  writeResult(result_id, req.body, function(){
    res.redirect('/result/'+result_id);
  });
};

exports.email = function(req, res){
  redis.sadd('axis:emails', req.body.email, function(){
    res.render('thankyou');
  });
};

exports.stats = function(req, res){
  redis.keys('axis:result:*', function(e, results){
    redis.scard('axis:emails', function(e, emails){
      res.render('stats', {results : results.length, emails: emails});
    });
  });
};
