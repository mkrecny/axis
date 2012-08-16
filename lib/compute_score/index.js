var beliefsDb = require('../../data/beliefs');

function roundNumber(num, dec) {
  return  Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
}

module.exports = function(data){
  var conservatism = 0
  , liberalism = 0;

  Object.keys(data).forEach(function(key){
    if (key==='age' || key==='lang' || key==='startup') return false;
    var belief = beliefsDb[key].type;
    if (belief==='liberal'){
      liberalism += data[key]/1;
      conservatism += 4 - (data[key]/1);
    } else if (belief==='conservative'){
      conservatism += data[key]/1;
      liberalism += 4 - (data[key]/1);
    }
  });

  var total = Object.keys(data).length*4
  var cons_pct = roundNumber((conservatism/total)*100, 2);
  var lib_pct = 100-cons_pct;
  return {liberalism:lib_pct, conservatism:cons_pct};
}
