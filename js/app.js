$(function() {
	socket = new WebSocket("ws://ws.blockchain.info/inv");

	socket.onopen = function(msg) {
		console.log("Socket opened!")
		socket.send(JSON.stringify({"op":"unconfirmed_sub"}));

		sys = arbor.ParticleSystem(1000, 600, 0.5);
		sys.parameters({
			gravity: false,
		});

		sys.renderer = Renderer('#viewport');
	}

	socket.onmessage = function(msg) {
		var data = $.parseJSON(msg.data);
		$.each(data.x.out, function(item) {
			var from = data.x.inputs[0].prev_out.addr;
			var to   = data.x.out[item].addr;
			var amount = data.x.out[item].value / 100000000
			var edgeData = {
				amount: amount,
				visible: true
			}

			node1 = sys.addNode(from);
			node2 = sys.addNode(to);

			node1.data = { from: true, visible: true };
			node2.data.from = { from: false, visible: true };

			sys.addEdge(node1, node2, edgeData);
		});
	};

	$('.slider').slider({min: 0, max: 2, step: 0.01});
	$('.slider').on('slide', function(e, ui) {
		var sliderValue = ui.value;
		var eur = Math.round(sliderValue * 670.21 * 100) / 100;
		var usd = Math.round(sliderValue * 823.44 * 100) / 100;


		$('.value-btc').html(sliderValue);
		$('.value-eur').html(eur);
		$('.value-usd').html(usd);


		sys.eachEdge(function(edge, pt1, pt2) {
			edge.data.visible = edge.data.amount > sliderValue ? true : false;
			edge.target.data.visible = edge.data.amount > sliderValue ? true : false;
		});
	})
});