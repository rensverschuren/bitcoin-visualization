$(function() {
	// function getExchangeRates() {
	// 	var request = $.ajax({
	// 		url: 'https://blockchain.info/nl/ticker',
	// 		type: 'GET',
	// 		succes: setExchangeRates(data),
	// 	});
	// 	request.done(function(response) {
	// 		console.log(response);
	// 	});
	// };

	// function setExchangeRates(data) {
	// 	console.log(data);
	// }

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
			sys.addEdge(from, to, { alone: true });
		});
	};
});