/*
 * -------------------
 * ADAPTER Module
 * -------------------
 *
 * Name: Generic Adapter Module
 * Description: Communicates with container, loads engines that expose the following functions:
 *      {
 *          init(),
 *          checkAnswer(),
 *          sendScores(),
 *          reviewAnswers(),
 *          closeLO() 
 *      }
 * 
 *
 * External Dependencies : ->
 * Following are shared/common dependencies (specified in index.html), and assumed to loaded via the platform)
 * 1. JQuery
 * 2. JSChannel
 *
 */
(function() {
	LOAdapter = (function() {
	var channel, engine;
	var initParams;
  
	/* Function to create/initialize jsChannel */
	var initChannel = function(callback) {
	  channel = Channel.build({
      window: window.parent,
      origin: '*',
      scope: 'cup-generic-default',
      onReady: function() {
        callback(channel);
      }
	  });
	};
  
	/* Function to bind methods with the created jschannel instance.  */  
	var bindChannel = function(channel) {
		channel.bind('receiveMessageFromContainer', function(trans, params) {
			if(params.type === 'checkAnswer') {
				return engine.checkAnswer(params.type);
			} else if(params.type === 'sendScores') {
				return engine.sendScores(params.type);
			} else if(params.type === 'reviewAnswers') {
				return engine.reviewAnswers(params.type);
			} else if(params.type === 'goNext') {
				return engine.goToNextScreen(params.type);
			} else if(params.type === 'goPrev') {
				return engine.goToPreviousScreen(params.type);
			} else if(params.type === 'close') {
				return closeConnections();
			} else if(params.type === 'currentScreen') {
				return engine.getCurrentScreenCount();
			} else if(params.type === 'totalScreens') {
				return engine.getTotalScreenCount();
			} else if(params.hasOwnProperty('type')) {
				throw {error: "method_not_found", message: 'method not found'};
			} else {
				throw {error: "invalid_request_structure", message: 'invalid request structure'};
			}
	  });
	};
  
	/* Function called when container calls the close method. This function calls engine closeLO method and notifies the 
	   container once LO is properly closed and cleaning operations performed, if any */
	var closeConnections = function() {
		var callback = function() {
			channel.notify({
				method: 'sendMessageToContainer',
				params: {
					type: 'terminated'
				}
			}); 
		}
		return engine.closeLO(callback);
	};
  
	/* Function to get initialization paramters from the container */
	var getInitParameters = function(callback) {
	  channel.call({
      method: 'sendMessageToContainer',
      params: {
        type: 'init'
      },
      success: function(params) {
				initParams = params;
        		callback();
			}
	  });
	};

	/* Function to load scripts */
	var getScript = function(src, callback) {
	  var s = document.createElement("script");
	  s.type = "text/" + (src.type || "javascript");
	  s.src = src.src || src;
	  s.async = false;
	  s.onload = function () {
		var state = s.readyState;
		if (!state || /loaded|complete/.test(state)) {
		  callback();
		}
	  };
	  s.onerror = function () {
		console.log('ERROR');
	  };
	  (document.body || document.head).appendChild(s);
	};
  
	/* Function called by the engine to notify container with the ready event when the LO is loaded and ready for interaction */
	var DOMReady = function() {
	  channel.notify({
			method: 'sendMessageToContainer',
			params: {
				type: 'ready'
			}
	  });
	};
  
	/* Function called by the engine to pass new state to the container */
	var newState = function(state) {
	  channel.call({
		  method: 'sendMessageToContainer',
		  params: {
			  type: 'newState', 
			  data: state
		  },
		  success: function() {},
		  error: function() {
			  console.log('newState method error');
		  }
	  });
	};
  
	/* Function called by the engine to pass new statements generated to the container */
	var newStatements = function(statement) {
	  channel.call({
			method: 'sendMessageToContainer',
			params: {
				type: 'newStatements',
			  data: statement
		  },
		  success: function() {},
		  error: function() {
			  console.log('newStatements method error');
		  }
	  });
	};
  
	/* Function called by the engine to pass controls change data to the container */
	var changeControlsVisibility = function(control, visible, buttonText) {
	  var params = {
			type: 'controlsChange',
			data: {
				control: control,
				meta: {
					buttonText: buttonText,
					type: 'button'
				},
				visible: visible
			}
	  };
	  channel.call({
      method: 'sendMessageToContainer',
      params: params,
      success: function() {},
      error: function() {
        console.log('controlsChange method error');
      }
	  });
	};
  
	/* Function called by the engine to pass dimensions change data to the container */
	var newDimensions = function(dimensions) {
	  channel.call({
		  method: 'sendMessageToContainer',
		  params: {
				type: 'size',
				data: {
					size: dimensions
				}
		  },
		  success: function() {},
		  error: function() {
			  console.log('size method error');
		  }
	  });
	};
  
	/* DOM Ready event */
	$(document).ready(function() {
	initChannel(
		function(channel) {
		  bindChannel(channel);
		  /* Get initiliazation paramters - contentPath and state, if any. */
		  getInitParameters(function() {
			/* Load scripts if any required */
			var script = 'js/engine.js';
			getScript(script, function() {
			  /* Create engine instance and initialize it */
			  engine = new Engine();
			  engine.init(initParams);        
			});
		  });
		});
	});
  
	return {
	  DOMReady: DOMReady,
	  newState: newState,
	  newStatements: newStatements, 
	  changeControlsVisibility: changeControlsVisibility,
	  newDimensions: newDimensions
	}
	})();
	return LOAdapter;  
}());
  