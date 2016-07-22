(function(win){

	function B(){};
	var GLOBAL = {
		state: 0,
		ID: 0,
		team: {},
		baseTeam: {},
		add: function(callback, dur, onend, delay, sleep){
			return this.Add(callback, { startTime: Date.now(), duration: dur || 1000 }, onend, delay, sleep);
		},
		_Add: function(id, callback, arg, onend, delay, sleep){
			this.team[id] = [callback
				, arg	//参数
				, typeof(onend)=='function'?onend:B	//onend
				, 1	//自身状态
				, delay || 0	//启动延迟
				, 0	//计数
				, sleep || 0	//执行间隔
				];
			return {
				restart: function(dur){
					arg.startTime = Date.now();
					arg.duration = dur || arg.duration;
					GLOBAL._Add(id, callback, arg, onend, delay, sleep).id;
					Run();
				},
				pause: function(){
					GLOBAL.team[id][3] = 0;
				},
				start: function(){
					GLOBAL.team[id][3] = 1;
				},
				remove: function(){
					if(id in GLOBAL.team){
						GLOBAL.team[id][3] = -1;
					}
				}
			}
		},
		Add: function(callback, arg, onend, delay, sleep){
			return this._Add('r' + ++this.ID, callback, arg, onend, delay, sleep);
		},
		addBase: function(callback, dur, onend, delay, sleep){
			return this.AddBase(callback, { startTime: Date.now(), duration: dur || 1000 }, onend, delay, sleep);
		},
		AddBase: function(callback, arg, onend, delay, sleep){
			var id = 'r' + ++this.ID;
			this.baseTeam[id] = [callback
				, arg
				, typeof(onend)=='function'?onend:B
				, 1
				, delay || 0
				, 0
				, sleep || 0
				];	
			return {
				restart: function(dur){
					arg.startTime = Date.now();
					arg.duration = dur || arg.duration;
					GLOBAL.AddBase(callback, arg, onend, delay, sleep);
					Run();
				},
				pause: function(){
					GLOBAL.baseTeam[id][3] = 0;
				},
				start: function(){
					GLOBAL.baseTeam[id][3] = 1;
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
		getState: function(key){
			return (this.baseTeam[key] || this.team[key])[3];
		},
		getSleep: function(key){
			return (this.baseTeam[key] || this.team[key])[6];
		},
		getDelay: function(key){
			// return (this.baseTeam[key] || this.team[key])[4];
			return GLOBAL.getCounter(key) > 0 ? this.getSleep(key) : (this.baseTeam[key] || this.team[key])[4];
		},
		getCounter: function(key){
			return (this.baseTeam[key] || this.team[key])[5];
		},
		setCounter: function(key){
			return (this.baseTeam[key] || this.team[key])[5] += 1;
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
		var keys = [], c = 0, r, d, delay;
		GLOBAL.each(function(fn, arg, onend, key){
			c++;
			switch(GLOBAL.getState(key)){
				case 0:
					return;
				case -1:
					keys.push(key);
					return;
			}
			delay = GLOBAL.getDelay(key);
			d = (now - arg.startTime - delay);
			if(d < 0){
				return;
			}
			r = fn(Math.min(d, arg.duration), arg.duration, interval);

			var stop = false;
			if(r === 0){
				stop = true;
			} else if(r === -1){
				stop = false;
				if(d >= arg.duration){
					arg.startTime = now;
					GLOBAL.setCounter(key);
				}
			} else if(d >= arg.duration){
				stop = true;
				GLOBAL.setCounter(key);
			}

			if(stop){
				keys.push(key);
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
		add: function(fn, dur, onend, delay, sleep){
			var a = GLOBAL.add(fn, dur, onend, delay, sleep);
			Run();
			return a;
		},
		addBase: function(fn, dur, onend, delay, sleep){
			var a = GLOBAL.addBase(fn, dur, onend, delay, sleep);
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
