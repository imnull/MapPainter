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

//point: { x, y }

function getCenterPoint(p0, p1){
	return {
		x: p0.x + (p1.x - p0.x) * .5,
		y: p0.y + (p1.y - p0.y) * .5
	}
}
function getCenterPoints(points){
	var ps = [];
	for(var i = 1; i < points.length; i++){
		ps.push(getCenterPoint(points[i - 1], points[i]));
	}
	ps.push(getCenterPoint(points[points.length - 1], points[0]));
	return ps;
}

function zoom(p, z){

	if(p instanceof Array){

		var r = [], i = 0;
		for(; i < p.length; i++){
			r.push(zoom(p[i], z));
		}
		return r;

	} else if(p instanceof Object){
		return {
			x: p.x * z, y: p.y * z
		}
	}
}

var A1 = Math.PI / 180;
var A30 = Math.PI / 6;

function ANG(d){
	return d * A1;
}

function stroke(ctx, color, width){
	ctx.strokeStyle = color || '#aaa';
	ctx.lineWidth = width || 1;
	ctx.stroke();
}

function fill(ctx, color){
	ctx.fillStyle = color || '#aaa';
	ctx.fill();
}


// function drawLine(ctx, points, color, width){
// 	ctx.beginPath();
// 	ctx.moveTo(points[0].x, points[0].y);
// 	for(var i = 1; i < points.length; i++){
// 		ctx.lineTo(points[i].x, points[i].y);
// 	}
// 	stroke(ctx, color, width);
// }

function distance(p0, p1){
	var x = p1.x - p0.x;
	var y = p1.y - p0.y;
	return Math.sqrt(x * x + y * y);
}

function Distance(arr){
	if(arr.length < 1) return -1;
	else if(arr.length < 2) return 0;
	else if(arr.length < 3){
		return distance(arr[0], arr[1]);
	} else {
		var p = arr[0], d = 0;
		for(var i = 1; i < arr.length; i++){
			d += distance(p, arr[i]);
			p = arr[i];
		}
		p = null;
		return d;
	}
}

function linePoint(p0, p1, t){
	t = typeof(t) == 'number' ? t : 1;
	var p;
	if(t === 1){
		p = p1;
	} else {
		var d = distance(p0, p1) * t;
		var a = Math.atan2(p1.y - p0.y, p1.x - p0.x);
		p = {
			x: p0.x + d * Math.cos(a),
			y: p0.y + d * Math.sin(a)
		}
	}
	return p;
}

function drawPoint(ctx, p, color, size){
	ctx.beginPath();
	// ctx.moveTo(p.x, p.y);
	// ctx.lineTo(p.x + 0.0001, p.y);
	// ctx.lineCap = 'round';
	ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
	// stroke(ctx, color, size);
	fill(ctx, color);
}

function drawPoints(ctx, arr, color, radio){
	radio = radio || 5;
	color = color || '#fff';
	MT.EACH(arr, function(a){
		drawPoint(ctx, a, color, radio);
	});
}
function drawLinePoint(ctx, p0, p1, t, color, size){
	drawPoint(ctx, linePoint(p0, p1, t), color, size);
}

function drawLine(ctx, p0, p1, t, color, width, noDrawNow){
	t = Math.max(-1, Math.min(1, t));
	if(t < 0){
		drawLine(ctx, p1, p0, 1 + t, color, width, noDrawNow)
	} else {
		p1 = linePoint(p0, p1, t);
		if(!noDrawNow) ctx.beginPath();
		ctx.moveTo(p0.x, p0.y);
		ctx.lineTo(p1.x, p1.y);
		if(!noDrawNow) stroke(ctx, color, width);
	}
	
}

function getAngle(p0, p1){
	return Math.atan2(p1.y - p0.y, p1.x - p0.x);
}

function rotatePoint(p, len, angle){
	if(!len) return p;
	return {
		x: len * Math.cos(angle) + p.x,
		y: len * Math.sin(angle) + p.y
	}
}

function originA(p0, p1, angle){

	if(!angle){
		return null;
	}

	var x = p1.x - p0.x;
	var y = p1.y - p0.y;
	var A = Math.atan2(y, x);

	if(angle < 0) angle += Math.PI * 1;

	var angle2 = (Math.PI - angle) * .5;

	var theta = A + angle2;

	var d = Math.sqrt(x * x + y * y);
	var r = (d * .5) / Math.sin(angle * .5);

	var X = r * Math.cos(theta) + p0.x;
	var Y = r * Math.sin(theta) + p0.y;

	return { x: X, y: Y, start: theta + Math.PI, duration: angle, radio: r, tangent: theta };
}
function OriginA(p0, p1, deg){
	return originA(p0, p1, ANG(deg));
}
function circlePathA(ctx, angle, p0, p1, t, color, width){
	t = t || 0;

	if(!t) return;

	var o = originA(p0, p1, angle);

	ctx.beginPath();
	if(t > 0){
		var a = o.duration * t + o.start;
		ctx.arc(o.x, o.y, o.radio, o.start, a);
	} else if(t < 0) {
		t = Math.abs(t);
		var a = o.duration * t + o.start;
		ctx.arc(o.x, o.y, o.radio, a, o.start + o.duration);
	}
	
	stroke(ctx, color, width);
}
function CirclePathA(ctx, deg, p0, p1, t, color, width){
	circlePathA(ctx, ANG(deg), p0, p1, t, color, width)
}
function circlePointA(p0, p1, angle, t){
	t = t || 0;
	var o = originA(p0, p1, angle), a = o.duration * t + o.start;
	return {
		x: o.x + o.radio * Math.cos(a),
		y: o.y + o.radio * Math.sin(a),
		tangent: a + Math.PI * .5
	}
}
function CirclePointA(p0, p1, deg, t){
	return circlePointA(p0, p1, ANG(deg), t)
}

function originA30(p0, p1){
	return originA(p0, p1, A30);
}
function circlePath(ctx, p0, p1, t, color, width){
	circlePathA(ctx, A30, p0, p1, t, color, width)
}

function circlePoint(p0, p1, t){
	return circlePointA(p0, p1, A30, t)
}

function dataRect(data, eachMethod){
	var left, top, right, bottom;
	eachMethod(data, function(p){
		if(left === undefined) left = p.x;
		if(right === undefined) right = p.x;
		if(top === undefined) top = p.y;
		if(bottom === undefined) bottom = p.y;
		left = Math.min(p.x, left);
		right = Math.max(p.x, right);
		top = Math.min(p.y, top);
		bottom = Math.max(p.y, bottom);
	});

	return {
		left: left, top: top, right: right, bottom: bottom
		, center: (right + left) * .5
		, middle: (bottom + top) * .5
		, width: right - left
		, height: bottom - top
	}
}

function translateData(data, eachMethod){
	var rect = dataRect(data, eachMethod);
	console.log(rect)
	eachMethod(data, function(p){
		p.x = rect.center - p.x;
		p.y = rect.middle - p.y;
	});
}

function translateCenterCanvas(ctx){
	ctx.save();
	ctx.translate((ctx.canvas.width) * .5, (ctx.canvas.height) * .5);
}

function fullFitDom(el){
	el = $(el).css({
		'transform-origin': '0px 0px'
	});

	var width = el.width(), height = el.height();

	var r = Math.min(window.innerWidth / width, window.innerHeight / height);
	el.css({
		'transform': 'scale(' + r + ',' + r + ')'
	});

	function fit(){
		var r = Math.min(window.innerWidth / width, window.innerHeight / height);
		GD.FIT_SCALE = r;
		el.css({
			'transform': 'scale(' + r + ',' + r + ')'
		});
	}

	$(window).on('resize', fit);

	fit();

}




win.GD = {
	FIT_SCALE: 1,
	stroke: stroke,
	fill: fill,
	distance: distance,
	circlePoint: circlePoint,
	circlePath: circlePath,
	originA30: originA30,
	center: getCenterPoint,
	getCenterPoints: getCenterPoints,
	zoom: zoom,
	dataRect: dataRect,
	translateCenterCanvas: translateCenterCanvas,
	translateData: translateData,
	fullFitDom: fullFitDom,
	drawPoints: drawPoints,
	drawPoint: drawPoint,
	originA: originA,
	OriginA: OriginA,
	circlePathA: circlePathA,
	CirclePathA: CirclePathA,
	circlePointA: circlePointA,
	CirclePointA: CirclePointA,
	linePoint: linePoint,
	drawLine: drawLine,
	drawLinePoint: drawLinePoint,
	util: {
		num: num,
		numV: numV,
		Num: Num,
		fun: fun,
		str: str,
		E: E,
		e: function(o, fn){
			for(var p in o){
				if(fn(o[p], p, o)) return;
			}
		}
	}
};


})(window)