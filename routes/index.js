var beliefsDb = require('../data/beliefs')
, get_2d_avg = require('../lib/get_2d_avg')
, age_lang = require('../lib/age_lang')
, redis = require('redis').createClient()
, computeScore = require('../lib/compute_score')
, _ = require('underscore')
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

exports.age = function(req, res){
  get_2d_avg('age', function(e, data){
    res.render('age', {data:data});
  });
};

exports.langs = function(req, res){
  age_lang('lang', function(e, data){
    data = _.sortBy(data, function(item){
      return item[1];
    });
    res.render('lang', {data:data});
  });
};

exports.langs_raw = function(req, res){
  age_lang('lang', function(e, data){
    data = _.sortBy(data, function(item){
      return item[1];
    });
    res.end(JSON.stringify(data));
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

exports.api_submissions = function(req, res){
  redis.keys('axis:result:*', function(e, keys){
    var multi = redis.multi();
    keys.forEach(function(key){
      multi.hgetall(key);
    });
    multi.exec(function(e, data){
      res.end(JSON.stringify({e:e, data:data}));
    });
  });
};

exports.api_questions = function(req, res){
  res.end(JSON.stringify({e:null, data:beliefsDb}));
};
