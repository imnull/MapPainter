(function(win){

var G = 0.081819190843;
//基准纬线
var RefLat = 30;


//计算墨卡托中央子午线(6度带)
// lat 纬度
// function CentralMeridian6(lat){
// 	var N = Math.round((lat + 3) / 6);
// 	return 6 * N - 3;
// }
// function Mercato(lat, lng){
// 	N0 = R / Math.sqrt( 1 - Math.pow(G, 2) * Math.pow(Math.sin(RefLat * A1), 2));
// 	q1 = Math.log(Math.tan((180.0 / 4.0 + lat / 2.0) * A1));
// 	q2 = G / 2 * Math.log((1 + G * Math.sin(lat * A1)) / (1 - G * Math.sin(lat * A1)));
// 	q = q1 - q2 ;
// 	x = N0 * Math.cos(RefLat * A1) * ((lng - CentralMeridian6(lat)) / 57.29577951) ;
// 	y = N0 * Math.cos(RefLat * A1) * q;

// 	console.log(x, y);
// }

// function Mercato(lat, lng){
// 	var x = lonLat.x * 20037508.34 / 180;
// 	double y = log(tan((90+lonLat.y)*PI/360))/(PI/180);
// 	y = y * 20037508.34/180;
// 	mercator.x = x;
// 	mercator.y = y;
// 	return mercator ;
// }

var R = 6378137.0;
var A1 = Math.PI / 180, A90 = Math.PI / 2;
var _A = 20037508.34 / 180;
function lonlat2mercator(lon, lat){
	return {
		x: lon * _A,
		y: lat === 0 ? 0 : Math.log(Math.tan((90 + lat) * A1 * .5)) / A1 * _A
	};
}
function Lonlat2Mercator(lonLat){
	return lonlat2mercator(lonLat.lon || lonLat.lng, lonLat.lat);
}
function mercator2lonlat(x, y){
	return {
		x: x / _A,
		y: 180 / Math.PI * (2 * Math.atan(Math.exp(y / _A * A1)) - A90)
	}
}
function Mercator2Lonlat(mercator){
	return mercator2lonlat(mercator.x, mercator.y);
}

win.geo = {
	lonlat2mercator: lonlat2mercator,
	Lonlat2Mercator: Lonlat2Mercator,
	mercator2lonlat: mercator2lonlat,
	Mercator2Lonlat: Mercator2Lonlat
};

})(window)

// (function(win){

// var earthRadiusMeters = 6371000.0;
// var metersPerDegree = 2.0 * Math.PI * earthRadiusMeters / 360.0;
// var radiansPerDegree = Math.PI / 180.0;
// var degreesPerRadian = 180.0 / Math.PI;
// var pointArr;

// $(document).ready(function() {
// 	pointArr = new Array();
// 	b();
// });


// function calculateArea(points) {
// 	if (points.length > 2) {
// 		var areaMeters2 = PlanarPolygonAreaMeters2(points);
// 		if (areaMeters2 > 1000000.0) {
// 			areaMeters2 = SphericalPolygonAreaMeters2(points);
// 			alert("面积为" + areaMeters2 + "平方米");
// 		}
// 	}
// }

// /*球面多边形面积计算*/
// function SphericalPolygonAreaMeters2(points) {
// 	var totalAngle = 0;
// 	for (var i = 0; i < points.length; i++) {
// 		var j = (i + 1) % points.length;
// 		var k = (i + 2) % points.length;
// 		totalAngle += Angle(points[i], points[j], points[k]);
// 	}
// 	var planarTotalAngle = (points.length - 2) * 180.0;
// 	var sphericalExcess = totalAngle - planarTotalAngle;
// 	if (sphericalExcess > 420.0) {
// 		totalAngle = points.length * 360.0 - totalAngle;
// 		sphericalExcess = totalAngle - planarTotalAngle;
// 	} else if (sphericalExcess > 300.0 && sphericalExcess < 420.0) {
// 		sphericalExcess = Math.abs(360.0 - sphericalExcess);
// 	}
// 	return sphericalExcess * radiansPerDegree * earthRadiusMeters * earthRadiusMeters;
// }

// /*角度*/
// function Angle(p1, p2, p3) {
// 	var bearing21 = Bearing(p2, p1);
// 	var bearing23 = Bearing(p2, p3);
// 	var angle = bearing21 - bearing23;
// 	if (angle < 0) {
// 		angle += 360;
// 	}
// 	return angle;
// }


// /*方向*/
// function Bearing(from, to) {
// 	var lat1 = from[1] * radiansPerDegree;
// 	var lon1 = from[0] * radiansPerDegree;
// 	var lat2 = to[1] * radiansPerDegree;
// 	var lon2 = to[0] * radiansPerDegree;
// 	var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
// 	if (angle < 0) {
// 		angle += Math.PI * 2.0;
// 	}
// 	angle = angle * degreesPerRadian;
// 	return angle;
// }

// /*平面多边形面积*/
// function PlanarPolygonAreaMeters2(points) {
// 	var a = 0;
// 	for (var i = 0; i < points.length; ++i) {
// 		var j = (i + 1) % points.length;
// 		var xi = points[i][0] * metersPerDegree * Math.cos(points[i][1] * radiansPerDegree);
// 		var yi = points[i][1] * metersPerDegree;
// 		var xj = points[j][0] * metersPerDegree * Math.cos(points[j][1] * radiansPerDegree);
// 		var yj = points[j][1] * metersPerDegree;
// 		a += xi * yj - xj * yi;
// 	}
// 	return Math.abs(a / 2);
// }
	
// function b() {
// 	var s = "112.523197631836,37.868892669677734;112.5170669555664,37.8605842590332;112.52099609375,37.849857330322266;112.54137420654297,37.8512732521875;112.5351180302734,37.858699798583984";
// 	var s1 = new Array()
// 	s1 = s.split(";");
// 	for (var i = 0; i < s1.length; i++) {
// 		var ss = s1[i];
// 		var temp = ss.split(",");
// 		var point = new Array();
// 		point.push(Number(temp[0]), Number(temp[1]));
// 		pointArr.push(point);
// 	}
// 	calculateArea(pointArr);
// }

// })(window)