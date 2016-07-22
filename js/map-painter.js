(function(win){
	function str(v){ return typeof(v) == 'string'; };
	function fun(v){ return typeof(v) == 'function'; };
	function num(v){ return typeof(v) == 'number'; };
	function Num(v){ return num(v) && !isNaN(v); };
	function numV(v, d){
		return Num(v) ? v : numV(d, 0);
	}
	function E(arr, fn, start){
		var i = numV(start), r = undefined;
		while(i < arr.length){
			if(r = fn(arr[i], i, arr) !== undefined) return r;
			i++;
		}
		return r;
	}

	function MapPainter(canvas){
		this.canvas = str(canvas) ? document.querySelector(canvas) : canvas;
		this.ctx = this.canvas.getContext('2d');
		this.adj = new Adjustor();
	};
	MapPainter.prototype = {
		fitCanvas: function(top, right, bottom, left){
			this.adj.fitCanvas(this.canvas, top, right, bottom, left);
			return this;
		},
		draw: function(data){
			this.rect = drawMap(this.ctx, data, this.adj);
			return this;
		},
		getLonlatCoord: function(lon, lat){
			return this.rect ? this.adj.recoordPoint(geo.lonlat2mercator(lon, lat), this.rect) : null;
		},
		GetLonlatCoord: function(lonLat){
			return this.rect ? this.adj.recoordPoint(geo.Lonlat2Mercator(lonLat), this.rect) : null;
		},
		drawLonlat: function(lon, lat, callback, arg){
			fun(callback) && callback(this.ctx, this.getLonlatCoord(lon, lat), arg);
		},
		DrawLonlat: function(lonLat, callback, arg){
			fun(callback) && callback(this.ctx, this.GetLonlatCoord(lonLat), arg);
		},
		DrawLonlatLine: function(lls, callback, arg){
			if(fun(callback)){
				var path = [];
				for(var i = 0; i < lls.length; i++){
					path.push(this.GetLonlatCoord(lls[i]));
				}
				callback(this.ctx, path, arg);
			}
		}
	};
	

	function RectTester(){
		this.top = this.right = this.bottom = this.left = undefined;
	};
	RectTester.prototype = {
		_: function(v, p, m){
			this[p] = typeof(this[p]) == 'undefined' ? v : Math[m](v, this[p]);
			return this;
		},
		test: function(x, y){
			return this.testH(x).testV(y);
		},
		testLeft: function(v){
			return this._(v, 'left', 'min');
		},
		testRight: function(v){
			return this._(v, 'right', 'max');
		},
		testTop: function(v){
			return this._(v, 'top', 'min');
		},
		testBottom: function(v){
			return this._(v, 'bottom', 'max');
		},
		testRect: function(rect){
			return this
				.testLeft(rect.left)
				.testRight(rect.right)
				.testTop(rect.top)
				.testBottom(rect.bottom)
				;
		},
		testH: function(v){
			return this._(v, 'left', 'min')._(v, 'right', 'max');
		},
		testV: function(v){
			return this._(v, 'top', 'min')._(v, 'bottom', 'max');
		},
		cal: function(){
			return {
				left: this.left,
				top: this.top,
				right: this.right,
				bottom: this.bottom,
				width: this.right - this.left,
				height: this.bottom - this.top,
				center: (this.left + this.right) * .5,
				middle: (this.top + this.bottom) * .5
			};
		}
	};
	function drawMap(ctx, data, adj){
		var map = geoDatas(data), rect = adj.calRect(map.rect);
		E(map.path, function(p){
			E(p, function(o){
				drawPath2(ctx, adj.recoord(o.coordinates, rect));
			})
		})
		map = null;
		return rect;
	}

	function drawPath2(ctx, p){
		ctx.beginPath();
		ctx.moveTo(p[0].x, p[0].y);
		E(p, function(P){
			ctx.lineTo(P.x, P.y);
		}, 1);
		ctx.closePath();
		ctx.lineCap = 'round';
		ctx.lineJoin = 'bevel';
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#333';
		ctx.stroke();
		ctx.fill();
	}

	function drawPath(ctx, p){
		ctx.beginPath();
		ctx.moveTo(p[0].x, p[0].y);
		E(p, function(P){
			ctx.lineTo(P.x, P.y);
		}, 1);
		ctx.closePath();
		ctx.lineCap = 'round';
		ctx.lineJoin = 'bevel';
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#fff';
		ctx.fillStyle = '#000';
		ctx.stroke();
		ctx.fill();
	}
	function getRect(left, top, right, bottom){
		return {
			left: left,
			top: top,
			right: right,
			bottom: bottom,
			width: right - left,
			height: bottom - top,
			center: (left + right) * .5,
			middle: (top + bottom) * .5
		};
	}
	function geoData1(lonLats){
		var mercators = [], rect = new RectTester();
		E(lonLats, function(ll){
			var lng = ll[0], lat = Math.max(-80, Math.min(80, ll[1]));
			var m = geo.lonlat2mercator(lng, lat);
			rect.test(m.x, m.y);
			mercators.push(m);
		})
		var result = {
			coordinates: mercators,
			rect: rect.cal()
		};
		mercators = rect = null;
		return result;
	}
	function getPolygon(coord, outPath, outerRect){
		E(coord, function(c){
			var d = geoData1(c);
			outerRect.testRect(d.rect);
			outPath.push(d);
		});
	}
	function getMultiPolygon(coords, outPath, outerRect){
		E(coords, function(coord){
			getPolygon(coord, outPath, outerRect);
		})
	}
	function geoDatas(features){
		var result = [], rect = new RectTester();
		E(features, function(f){
			var path = [];
			switch(f.geometry.type){
				case 'Polygon':
					getPolygon(f.geometry.coordinates, path, rect);
					break;
				case 'MultiPolygon':
					getMultiPolygon(f.geometry.coordinates, path, rect);
					break;
				default:
					console.log(f.geometry.type)
					break;
			}
			result.push(path);
		})
		var r = {
			path: result,
			rect: rect.cal()
		};
		return r;
	}

	function Adjustor(){
		this.top = 0;
		this.right = 0;
		this.bottom = 0;
		this.left = 0;
	}
	Adjustor.prototype = {
		size: function(w, h){
			this.width = w;
			this.height = h;
			return this;
		},
		offset: function(x, y){
			this.x = x;
			this.y = y;
			return this;
		},
		fitCanvas: function(cvs, top, right, bottom, left){
			this.top = top || 0;
			this.right = right || 0;
			this.bottom = bottom || 0;
			this.left = left || 0;

			this.size(cvs.width - this.left - this.right, cvs.height - this.top - this.bottom);
			this.offset(this.width * .5 + this.left, this.height * .5 + this.top);
			return this;
		},
		calRect: function(rect){
			this.scale = Math.min(this.width / rect.width, this.height / rect.height);
			var r = {};
			for(var p in rect){
				r[p] = rect[p] * this.scale;
			}
			return r;
		},
		recoordPoint: function(p, rect){
			return {
				x: p.x * this.scale - rect.left + this.left,
				y: rect.height - (p.y * this.scale - rect.top) + this.top
			};
			// p.x = p.x * this.scale - rect.left + this.left;
			// p.y = rect.height - (p.y * this.scale - rect.top) + this.top;
			// return this;
		},
		recoord: function(path, rect){
			var ps = [];
			for(var i = 0; i < path.length; i++){
				ps.push(this.recoordPoint(path[i], rect));
			}
			return ps;
		}
	};

	win.MapPainter = MapPainter;
})(window);