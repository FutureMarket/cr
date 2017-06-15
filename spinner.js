
var TheFutureMarkethu = '0';
var Cheight = ($('.countdown').outerHeight(true)+$('#atf').outerHeight(true))-($('.info-spinner').outerHeight(true)/2);

	
  // from my pen: https://codepen.io/kryo2k/pen/NPxVZN
  function Scale(vlow, vhigh, low, high, algo, precision) {

    var
    algorithm = Scale.Algorithms[algo || 'linear'];

    if(!algorithm) throw 'Invalid algorithm was provided';

    function normalize(v, min, max) {
      var
      tV = parseFloat(v);

      min = (min === undefined) ? -Infinity : parseFloat(min);
      max = (max === undefined) ?  Infinity : parseFloat(max);

      if(isNaN(tV) || isNaN(min) || isNaN(max)) {
        return false;
      }

      return Math.max(Math.min(min, max), Math.min(Math.max(max, min), tV))
    }

    function round(v, p) {
      if(!p) {
        return Math.round(v)
      }
      else {
        var f = Math.pow(10, p);
        return Math.round(v * f) / f;
      }
    }

    var
    nL  = parseFloat(vlow), nH  = parseFloat(vhigh),
    nlL = parseFloat(low),  nlH = parseFloat(high);

    if(isNaN(nL))  throw 'Invalid low value';
    if(isNaN(nH))  throw 'Invalid high value';
    if(isNaN(nlL)) throw 'Invalid scaled low value';
    if(isNaN(nlH)) throw 'Invalid scaled high value';

    var
    rL  = normalize(nL,  nL,  nH),  rH  = normalize(nH,  nL,  nH),
    rlL = normalize(nlL, nlL, nlH), rlH = normalize(nlH, nlL, nlH);

    this.calculate = function (v) {
      return round((rlL + algorithm(normalize(v, rL, rH) - rL, 0, (rlH - rlL), rH - rL)), precision);
    };
  }

  Scale.Algorithms = {
    linear: function (t, b, c, d) {
      return c*t/d + b;
    },

    // quadratic
    quadIn: function (t, b, c, d) {
      t /= d;
      return c*t*t + b;
    },
    quadOut: function (t, b, c, d) {
      t /= d;
      return -c * t*(t-2) + b;
    },
    quadInOut: function (t, b, c, d) {
      t /= d/2;
      if (t < 1) return c/2*t*t + b;
      t--;
      return -c/2 * (t*(t-2) - 1) + b;
    },

    // cubic
    cubicIn: function (t, b, c, d) {
      t /= d;
      return c*t*t*t + b;
    },
    cubicOut: function (t, b, c, d) {
      t /= d;
      t--;
      return c*(t*t*t + 1) + b;
    },
    cubicInOut: function (t, b, c, d) {
      t /= d/2;
      if (t < 1) return c/2*t*t*t + b;
      t -= 2;
      return c/2*(t*t*t + 2) + b;
    },

    // quartic
    quartIn: function (t, b, c, d) {
      t /= d;
      return c*t*t*t*t + b;
    },
    quartOut: function (t, b, c, d) {
      t /= d;
      t--;
      return -c * (t*t*t*t - 1) + b;
    },
    quartInOut: function (t, b, c, d) {
      t /= d/2;
      if (t < 1) return c/2*t*t*t*t + b;
      t -= 2;
      return -c/2 * (t*t*t*t - 2) + b;
    },

    // quintic
    quintIn: function (t, b, c, d) {
      t /= d;
      return c*t*t*t*t*t + b;
    },
    quintOut: function (t, b, c, d) {
      t /= d;
      t--;
      return c*(t*t*t*t*t + 1) + b;
    },
    quintInOut: function (t, b, c, d) {
      t /= d/2;
      if (t < 1) return c/2*t*t*t*t*t + b;
      t -= 2;
      return c/2*(t*t*t*t*t + 2) + b;
    },

    // sinusoidal
    sineIn: function (t, b, c, d) {
     return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    },
    sineOut: function (t, b, c, d) {
      return c * Math.sin(t/d * (Math.PI/2)) + b;
    },
    sineInOut: function (t, b, c, d) {
      return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    },

    // exponential
    expoIn: function (t, b, c, d) {
      return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
    },
    expoOut: function (t, b, c, d) {
      return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
    },
    expoInOut: function (t, b, c, d) {
      t /= d/2;
      if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
      t--;
      return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
    },

    // circular
    circIn: function (t, b, c, d) {
      t /= d;
      return -c * (Math.sqrt(1 - t*t) - 1) + b;
    },
    circOut: function (t, b, c, d) {
      t /= d;
      t--;
      return c * Math.sqrt(1 - t*t) + b;
    },
    circInOut: function (t, b, c, d) {
      t /= d/2;
      if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
      t -= 2;
      return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
    }
  };
  
  /**
  * jQuery plugin by Hans
  */
  $.fn.numberSpin = function NumberSpin(spec) {
    var
    el              = this,
    cbStart         = spec.onStart || $.noop,
    cbFinish        = spec.onFinish || $.noop,
    lastValue       = parseFloat(spec.startAt || 0),
    defaultAlgo     = spec.algo || 'linear',
    defaultDuration = parseInt(spec.duration || 0),
    defaultSteps    = spec.steps || 25,
    defaultPrec     = spec.precision || 0;

    function Spinner() {
      var timeouts;

      function interpolateChange(from, to, duration, steps, algo, precision) {
        var
        scaleDur = new Scale(0, (steps - 1), 0, duration, 'linear', precision),
        scaleVal = new Scale(0, (steps - 1), parseFloat(from), parseFloat(to), algo, precision),
        todo     = [];

        for(var i = 0; i < steps; i++) {
          todo.push([scaleVal.calculate(i).toFixed(precision),  scaleDur.calculate(i)]);
        }

        return todo;
      }

      this.changeTo = function(v, duration, steps, algo, precision) {
        v = parseFloat(v||lastValue);
        duration = parseInt(duration || defaultDuration);
        steps = parseInt(steps || defaultSteps);
        algo = algo || defaultAlgo;
        precision = parseInt(precision || defaultPrec);
         
          
        if(v === lastValue) {
         
          return;

        }//return; // do nothing
        if(timeouts) { // clean up previous timeouts
          timeouts.forEach(function(t){
            clearTimeout(t);
          });
          el.html(lastValue);
          timeouts = null;
        }
        cbStart(lastValue, v);
        timeouts = interpolateChange(lastValue, v, duration, steps, algo, precision)
          .map(function (i, index, all) {
            return setTimeout((function (val, oval) {
              return function() {
                el.html(val);
               
                if(index === (all.length - 1)) {
                  cbFinish(val, oval);
                  timeouts = null;
                }
              }
            })(i[0], lastValue), i[1]);
          });
        lastValue = v;
     		
        return this;
      };

      if(spec.value) {
        this.changeTo(spec.value, defaultDuration, defaultSteps, defaultAlgo);
      }
    }

    return new Spinner();
  };
function porog(){
  var // VALUE
  ctrlElValue  = Vvalue,
  ctrlElSpeed  = '1500',
  ctrlElSteps  = '100',
  ctrlElPrec   = '0',
  ctrlElAlgo   = 'quintOut',
  ctrl = $('.value').numberSpin({
    startAt: 0,
    value: ctrlElValue,
    duration: ctrlElSpeed,
    algo: ctrlElAlgo,
    steps: ctrlElSteps,
    precision: ctrlElPrec,
    //onStart: function(current, target) {
    //  console.log('Starting', arguments);
    //}
    onFinish: function() {
     //console.log('Finished', arguments);
     	var a = $('.value').html();
     	a = a.replace(new RegExp("^(\\d{" + (a.length%3?a.length%3:0) + "})(\\d{3})", "g"), "$1 $2").replace(/(\d{3})+?/gi, "$1 ").trim();
    	$('.value').html(a);
    }
  });
	var // participant
	  partcElValue  = Vparticipant,
	  partcElSpeed  = '1500',
	  partcElSteps  = '100',
	  partcElPrec   = '0',
	  partcElAlgo   = 'quintOut',
	  partc = $('.participant').numberSpin({
	    startAt: 0,
	    value: partcElValue,
	    duration:partcElSpeed,
	    algo: partcElAlgo,
	    steps: partcElSteps,
	    precision: partcElPrec,
	    //onStart: function(current, target) {
	    //  console.log('Starting', arguments);
	    //}
	    onFinish: function() {
	     //console.log('Finished', arguments);
	     	var b = $('.participant').html();
	     	b = b.replace(new RegExp("^(\\d{" + (b.length%3?b.length%3:0) + "})(\\d{3})", "g"), "$1 $2").replace(/(\d{3})+?/gi, "$1 ").trim();
	    	$('.participant').html(b);
	    }
	  });
	  var // issued
	  issuElValue  = Vissued,
	  issuElSpeed  = '1500',
	  issuElSteps  = '100',
	  issuElPrec   = '0',
	  issuElAlgo   = 'quintOut',
	  issu = $('.issued').numberSpin({
	    startAt: 0,
	    value: issuElValue,
	    duration:issuElSpeed,
	    algo: issuElAlgo,
	    steps: issuElSteps,
	    precision: issuElPrec,
	    //onStart: function(current, target) {
	    //  console.log('Starting', arguments);
	    //}
	    onFinish: function() {
	     //console.log('Finished', arguments);
	     	var c = $('.issued').html();
	     	c = c.replace(new RegExp("^(\\d{" + (c.length%3?c.length%3:0) + "})(\\d{3})", "g"), "$1 $2").replace(/(\d{3})+?/gi, "$1 ").trim();
	    	$('.issued').html(c);
	    }
	  });
  
};
$(document).ready(function () {
	
	if(($(window).scrollTop() >= (Cheight)) && TheFutureMarkethu === '0' ){
			TheFutureMarkethu = '1';
			porog();
	}
	if (TheFutureMarkethu === '0') {			
		$(window).scroll(function () {
			//console.log({'Cheight':Cheight, 'Scroll': $(window).scrollTop()});
			if(($(window).scrollTop() >= (Cheight)) && TheFutureMarkethu === '0' ){
				TheFutureMarkethu = '1';
				porog();
				
			}		
		});
	}
	
});