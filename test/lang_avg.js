var _ = require('underscore');
var get_2d_avg = require('../lib/age_lang');
get_2d_avg('lang', function(e, data){
  console.log(_.sortBy(data, function(item){
    return item[1];
  }));
});
