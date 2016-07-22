(function(win){

	function B(){};
	var GLOBAL = {
		state: 0,
		ID: 0,
		team: {},
		baseTeam: {},
		add: function(callback, dur, onend){
			return this.Add(callback, { startTime: Date.now(), duration: dur || 1000 }, onend);
		},
		Add: function(callback, arg, onend){
			this.team['r' + ++this.ID] = [callback, arg, typeof(onend)=='function'?onend:B];
			return {
				restart: function(dur){
					arg.startTime = Date.now();
					arg.duration = dur || arg.duration;
					GLOBAL.Add(callback, arg, onend);
					Run();
				}
			}
		},
		addBase: function(callback, dur, onend){
			return this.AddBase(callback, { startTime: Date.now(), duration: dur || 1000 }, onend);
		},
		AddBase: function(callback, arg, onend){
			this.baseTeam['r' + ++this.ID] = [callback, arg, typeof(onend)=='function'?onend:B];
			return {
				restart: function(dur){
					arg.startTime = Date.now();
					arg.duration = dur || arg.duration;
					GLOBAL.AddBase(callback, arg, onend);
					Run();
				}
			}
		},
		each: function(fn){
			for(var p in this.baseTeam){
				fn(this.baseTeam[p][0], this.baseTeam[p][1], this.baseTeam[p][2], p, 1);
			}
			for(var p in this.team){
				fn(this.team[p][0], this.team[p][1], this.team[p][2], p, 0);
			}
		},
		isEmpty: function(){
			for(var p in this.team){
				return false;
			}
			return true;
		},
		clear: function(fn){
			this.onstopone = function(){
				this.team = {};
				this.state = 0;
				typeof(fn) == 'function' && fn();
			};
			this.state = -1;
		}
	};

	function Run(){
		if(GLOBAL.state == 1) return;
		if(GLOBAL.state === 0){
			GLOBAL.startTime = Date.now();
			GLOBAL.previousTime = GLOBAL.startTime;
			GLOBAL.state = 1;
			RUN();
		}
	}

	function RUN(){

		if(GLOBAL.state == -1){
			typeof(GLOBAL.onstopone) == 'function' && GLOBAL.onstopone();
			delete GLOBAL.onstopone;
			return;
		}
		
		var now = Date.now(), dur = now - GLOBAL.startTime, interval = now - GLOBAL.previousTime;
		var keys = [], c = 0, r, d;
		GLOBAL.each(function(fn, arg, onend, key){
			c++;
			d = (now - arg.startTime);
			r = fn(Math.min(d, arg.duration), interval);

			var stop = false;
			if(r === 0){
				stop = true;
			} else if(r === -1){
				stop = false;
				if(d > arg.duration){
					arg.startTime = now;
				}
			} else if(d >= arg.duration){
				stop = true;
			}

			if(stop){
				keys.push(key)
			}

		});
		for(var i = 0; i < keys.length; i++){
			if(keys[i] in GLOBAL.team){
				d = GLOBAL.team[keys[i]][2];
				delete GLOBAL.team[keys[i]];
				keys[i] = d;
			}
			if(keys[i] in GLOBAL.baseTeam){
				d = GLOBAL.baseTeam[keys[i]][2];
				delete GLOBAL.baseTeam[keys[i]];
				keys[i] = d;
			}
		}
		for(var i = 0; i < keys.length; i++){
			keys[i]();
		}
		// console.log(keys, GLOBAL.team, c);
		GLOBAL.previousTime = now;

		if(c < 1){
			GLOBAL.state = 0;
			delete GLOBAL.startTime;
			delete GLOBAL.previousTime;
			return;
		} else {
			requestAnimationFrame(RUN);
		}
	}

	win.Ani = {
		add: function(fn, dur, onend){
			var a = GLOBAL.add(fn, dur, onend);
			Run();
			return a;
		},
		addBase: function(fn, dur, onend){
			var a = GLOBAL.addBase(fn, dur, onend);
			Run();
			return a;
		},
		isEmpty: function(){
			return GLOBAL.isEmpty();
		},
		clear: function(fn){
			GLOBAL.clear(fn);
		}
	};
})(window);
