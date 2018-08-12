/* Class definition */
function pptIOTClient(clientID) {
	// variables
	var connected = false;
	var client = new Paho.Client("iot.eclipse.org", Number(80), "/ws", clientID);
	var me = this;
	this.connected = false;
	this.onDisconnect = null;
	this.onConnect = null;
	this.onConnectFail = null;

	// set callback handlers
	client.onConnectionLost = function(responseObject) {
		me.connected = false;
		console.log("Connection Lost: " + responseObject.errorMessage);
		if (me.onDisconnect)
			me.onDisconnect();
		// try reconnect
		me.init();
	}

	client.onMessageArrived = function(message) {
		console.log("Message Arrived: " + message.payloadString);
	}

	// connect
	this.init = function() {
		client
				.connect({
					timeout : 3,
					onSuccess : function() {
						me.connected = true;
						console.log("mqtt connected");

						if (me.onConnect)
							me.onConnect();
						
						// subscripe do not work well in tizen
						// client.subscribe('pptIOTKeys');
					},
					onFailure : function(message) {
						console.log("Connection failed: "
								+ message.errorMessage);
						
						if (me.onConnectFail)
							me.onConnectFail(message.errorMessage);
					}
				});
	};

	// no comments for this
	this.sendMessage = function(message) {
		var payload = new Paho.Message(message);
		console.log("Sending " + message);
		payload.destinationName = "pptIOTKeys";
		client.send(payload);
	}
}
