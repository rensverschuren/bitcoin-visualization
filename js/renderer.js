$(function() {
	Renderer = function(canvas) {
		var canvas = $(canvas).get(0);
		var ctx = canvas.getContext('2d');
		var particleSystem;

		var that = {
			init:function(system) {
				particleSystem = system;
				particleSystem.screenSize(canvas.width, canvas.height);
				particleSystem.screenPadding(80);
				that.initMouseHandling()
			},

			redraw:function(){
				// 
				// redraw will be called repeatedly during the run whenever the node positions
				// change. the new positions for the nodes can be accessed by looking at the
				// .p attribute of a given node. however the p.x & p.y values are in the coordinates
				// of the particle system rather than the screen. you can either map them to
				// the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
				// which allow you to step through the actual node objects but also pass an
				// x,y point in the screen's coordinate system
				// 
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(0,0, canvas.width, canvas.height);
				var nodeBoxes = {}

				particleSystem.eachNode(function(node, pt){
					// node: {mass:#, p:{x,y}, name:"", data:{}}
					// pt:   {x:#, y:#}  node position in screen coords

					// draw a rectangle centered at pt

					

					var w = 10;
					
					if(node.data.from === true) {
						ctx.fillStyle = "#000000";
					}
					else {
						ctx.fillStyle = node.data.visible ? "rgba(255,0,0,0.5)" : "#cccccc";
						var w = (node.data.amount * 1.2) + 10;
					}
					ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w);
					nodeBoxes[node.name] = [pt.x-w/2, pt.y-11, w, 22]
				}); 

				particleSystem.eachEdge(function(edge, pt1, pt2){

					// edge: {source:Node, target:Node, length:#, data:{}}
					// pt1:  {x:#, y:#}  source position in screen coords
					// pt2:  {x:#, y:#}  target position in screen coords

					// draw a line from pt1 to pt2
					ctx.strokeStyle = edge.data.visible ? "#000000" : "#cccccc";
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(pt1.x, pt1.y);
					ctx.lineTo(pt2.x, pt2.y);
					ctx.stroke();

					ctx.font = "12px Helvetica"
					ctx.textAlign = "center"
					ctx.fillStyle = "black"
					var textX = intersect_line_line(pt1.x, pt1.y, pt2.x, pt2.y)
					var textY = intersect_line_line(pt1.x, pt1.y, pt2.x, pt2.y)
					ctx.fillText("test", textX.x , textY.y)

					ctx.save()
					//draw that freakn arrow!
					var tail = intersect_line_box(pt1, pt2, nodeBoxes[edge.source.name])
          			var head = intersect_line_box(tail, pt2, nodeBoxes[edge.target.name])

					var weight = edge.data.weight
					var wt = !isNaN(weight) ? parseFloat(weight) : 1;
					var arrowLength = 6 + wt
              		var arrowWidth = 2 + wt
              		ctx.fillStyle = edge.data.visible ? "#000000" : "#cccccc";
              		ctx.translate(head.x, head.y);
              		ctx.rotate(Math.atan2(head.y - tail.y, head.x - tail.x));

              		ctx.clearRect(-arrowLength/2,-wt/2, arrowLength/2,wt)

					// draw the chevron
					ctx.beginPath();
					ctx.moveTo(-arrowLength, arrowWidth);
					ctx.lineTo(0, 0);
					ctx.lineTo(-arrowLength, -arrowWidth);
					ctx.lineTo(-arrowLength * 0.8, -0);
					ctx.closePath();
					ctx.fill();
					ctx.restore()
				});
			},
			initMouseHandling:function(){
				var handler = {
					clicked:function(e) {
						var pos = $(canvas).offset();
						_mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
						selected = nearest = dragged = particleSystem.nearest(_mouseP);
						console.log(selected);
					}
				}
				$(canvas).mousedown(handler.clicked);
			}
		}

		// helpers for figuring out where to draw arrows (thanks springy.js)
	    var intersect_line_line = function(p1, p2, p3, p4) {
			var denom = ((p4.y - p3.y)*(p2.x - p1.x) - (p4.x - p3.x)*(p2.y - p1.y));
			if (denom === 0) return false // lines are parallel
			var ua = ((p4.x - p3.x)*(p1.y - p3.y) - (p4.y - p3.y)*(p1.x - p3.x)) / denom;
			var ub = ((p2.x - p1.x)*(p1.y - p3.y) - (p2.y - p1.y)*(p1.x - p3.x)) / denom;

			if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return false
			return arbor.Point(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
		}

		var intersect_line_box = function(p1, p2, boxTuple) {
			var p3 = {x:boxTuple[0], y:boxTuple[1]},
			w = boxTuple[2],
			h = boxTuple[3]

			var tl = {x: p3.x, y: p3.y};
			var tr = {x: p3.x + w, y: p3.y};
			var bl = {x: p3.x, y: p3.y + h};
			var br = {x: p3.x + w, y: p3.y + h};

			return intersect_line_line(p1, p2, tl, tr) ||
				intersect_line_line(p1, p2, tr, br) ||
				intersect_line_line(p1, p2, br, bl) ||
				intersect_line_line(p1, p2, bl, tl) ||
	            false
	    }
		return that;
	}
});