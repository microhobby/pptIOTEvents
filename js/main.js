/* Set screen always turn on */
tizen.power.request("CPU", "CPU_AWAKE");
tizen.power.request("SCREEN", "SCREEN_NORMAL");

/* global vars */
var events = new pptIOTClient("pptIOTEvents");
var count = 1;

/* DOM load completed */
window.onload = function() {
	/* local vars */
	var mainPage = document.querySelector('#main');
	var timeStart = null;
	var ptrInterval = null;
	
	/* initializations */

	// init mqtt handler
	events.init();

	/* local functions */
	
	function getZeroLeft(num) {
		return num < 10 ? "0" + num : num;
	}
	
	function starTime () {
		timeStart = new Date();
		if (!ptrInterval)
			ptrInterval = setInterval(function() {
				var timeNow = new Date();
				var timeDiff = new Date(timeNow - timeStart);
				timepass =  getZeroLeft(timeDiff.getMinutes()) + ":" + 
					getZeroLeft(timeDiff.getSeconds());
				// set time pass
				document.querySelector('#content-time').innerHTML = timepass;
			}, 1000);
	}
	
	/* events handlers */
	
	// if disconnect from broker
	events.onDisconnect = function () {
		document.getElementsByTagName("body")[0].style.backgroundColor = "red";
	};
	
	// when connect broker
	events.onConnect = function () {
		document.getElementsByTagName("body")[0].style.backgroundColor = "black";
	};
	
	// try to connect but it fails
	events.onConnectFail = function (err) {
		document.getElementsByTagName("body")[0].style.backgroundColor = "blue";
		document.querySelector('#content-text').innerHTML = err;
	};

	// close app when back key
	document.addEventListener('tizenhwkey', function(e) {
		if (e.keyName === "back") {
			try {
				tizen.application.getCurrentApplication().exit();
			} catch (ignore) {
			}
		}
	});

	// handle bessel events
	document.addEventListener("rotarydetent", function(event) {
		var besselRight = (event.detail.direction === "CW");
		var besselLeft = (event.detail.direction === "CCW");
		var contentText = document.querySelector('#content-text');

		// Use bessel to send key events to host
		if (besselRight && events.connected) {
			count++;
			contentText.innerHTML = "Next " + count;
			console.log("next");
			events.sendMessage("next");
			
			// check if is first slide next
			if (!ptrInterval)
				starTime ();
			
		} else if (besselLeft && events.connected) {
			count--;
			contentText.innerHTML = "Preview " + count;
			console.log("preview");
			events.sendMessage("preview");
		}

	}, false);

	// click on text for reconnect mqtt handle
	mainPage.addEventListener("click", function() {
		var contentText = document.querySelector('#content-text');

		contentText.innerHTML = "reconect";
		if (!events.connected)
			events.init();
	});
};