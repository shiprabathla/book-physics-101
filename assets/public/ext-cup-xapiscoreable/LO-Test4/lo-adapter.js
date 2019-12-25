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
(function () {
	var channel, engine;
	var loWithoutControls = true;

	// variable to hold the Activity Player instance
	var activity = null;

	// var to hold current state
	var currentState = null;

	// var to hold the current status of LO
	var currentStatus = null;

	// relative path for the item JSON
	var jsonPath = "data/data.json";

	// var to hold unique ID for this LO
	var contentId;

	// various status which are sent to container / experience app
	var status = {
		CHECKED: 'checked',
		RESET: 'reset',
		CHANGE: 'change'
	}

	// initializing currentScore with initial score being 0
	var currentScore = 0;


	/* Function to create/initialize jsChannel */
	var initChannel = function (callback) {
		channel = Channel.build({
			window: window.parent,
			origin: '*',
			scope: 'cup-generic-default',
			onReady: function () {
				callback(channel);
			}
		});
	};

	/* Function to bind methods with the created jschannel instance.  */
	var bindChannel = function (channel) {
		channel.bind('receiveMessageFromContainer', function (trans, params) {
			if (params.type === 'checkAnswers') {

				activity.submit();
				/*changeControlsVisibility('hint', false, 'Hints');*/
				/*changeControlsVisibility ('checkAnswers', false, "Check My Work");*/
				
				
			} else if (params.type === 'sendScores') {
				return engine.sendScores(params.type);
			} else if (params.type === 'reviewAnswers') {
				return engine.reviewAnswers(params.type);
			} else if (params.type === 'goNext') {
				
				/*return engine.goToNextScreen(params.type);*/
				return activity.goToNextItem();	

			} else if (params.type === 'goPrev') {
				
				/*return engine.goToPreviousScreen(params.type);*/
				return activity.goToPreviousItem();	

			} else if (params.type === 'close') {
				
				/*return closeConnections();*/
				return activity.destroy();

			} else if (params.type === 'hint') {
				
				let remainingHintsCount = activity.getCurrentItem().showHints();
				
				if (remainingHintsCount == 0) {
					changeControlsVisibility ('hint', false, "Hints");
				}

			} else if (params.type === 'currentScreen') {
				
				return activity.getItems().indexOf(activity.getCurrentItem());

			} else if (params.type === 'totalScreens') {
								
				return activity.getItems().length;
				
			} else if (params.hasOwnProperty('type')) {
				throw { error: "method_not_found", message: 'method not found' };
			} else {
				throw { error: "invalid_request_structure", message: 'invalid request structure' };
			}
		});
	};

	/* Function called when container calls the close method. This function calls engine closeLO method and notifies the 
	   container once LO is properly closed and cleaning operations performed, if any */
	var closeConnections = function () {
		
		channel.notify({
			method: 'sendMessageToContainer',
			params: {
				type: 'terminated'
			}
		});
		
		/*var callback = function () {
			
		}
		return activity.destroy(callback);*/
	};

	/* Function to get initialization paramters from the container */
	var getInitParameters = function (callback) {
		channel.call({
			method: 'sendMessageToContainer',
			params: {
				type: 'init'
			},
			success: function (params) {
				callback(params);
			}
		});
	};

	/* Function to load scripts */
	var getScript = function (src, callback) {
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
	var DOMReady = function () {
		channel.notify({
			method: 'sendMessageToContainer',
			params: {
				type: 'ready'
			}
		});
	};

	var firstItemReady = function () {
		channel.notify({
			method: 'sendMessageToContainer',
			params: {
				type: 'firstScreenReady'
			}
		});
	}

	/* Function called by the engine to pass new state to the container */
	var newState = function (state) {
		channel.call({
			method: 'sendMessageToContainer',
			params: {
				type: 'newState',
				data: state
			},
			success: function () { },
			error: function () {
				console.log('newState method error');
			}
		});
	};

	/* Function called by the engine to pass new statements generated to the container */
	var newStatements = function (statement) {
		channel.call({
			method: 'sendMessageToContainer',
			params: {
				type: 'newStatements',
				data: statement
			},
			success: function () { },
			error: function () {
				console.log('newStatements method error');
			}
		});
	};

	/* Function called by the engine to pass controls change data to the container */
	var changeControlsVisibility = function (control, visible, buttonText) {
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
			success: function () { },
			error: function () {
				console.log('controlsChange method error');
			}
		});
	};

	/* Function called by the engine to pass dimensions change data to the container */
	var newDimensions = function (dimensions) {
		channel.call({
			method: 'sendMessageToContainer',
			params: {
				type: 'size',
				data: {
					size: dimensions
				}
			},
			success: function () { },
			error: function () {
				console.log('size method error');
			}
		});
	};

	var updateState = function () {
		currentState = {
			data: activity.getCurrentItem().getState(),
			status: currentStatus,
			score: currentScore
		};
		newState(currentState);
	}

	var launchLeonardoPlayer = function () {

		// registering the app with leonardo SDK
		LeonardoApp.register();

		var container = document.getElementById('player-container');

		let options = {
			playerConfig: {
				uiStyles: { 
					dimensions: "content-dim"
				},
				buttons: {
					visible: !loWithoutControls
				}
			},
			events: {
				render: function (eventArgs) {
					if (currentState && currentState.data) {
						activity.getCurrentItem().setState(currentState.data);
					}
					DOMReady();
					firstItemReady();
					
					let dims = activity.getOptimumDimensions();
					if(dims){
						container.style.height = dims.height + "px";
						container.style.width = dims.width + "px";
						/*delete dims.width;*/
						newDimensions( dims );
					}

					changeControlsVisibility ('checkAnswers', true, "Check Answer");

					let itemCount = activity.getItemCount();
					if( itemCount > 1){
						changeControlsVisibility ('goPrev', true, "Previous");
						changeControlsVisibility ('goNext', true, "Next");
					}else{
						changeControlsVisibility ('goNext', false, "Next");
						changeControlsVisibility ('goPrev', false, "Previous");
					}
					
					if(activity.getCurrentItem().hasHints()){
						changeControlsVisibility ('hint', true, "Hints");
					}
					
				},
				change: function (eventArgs) {
					let previousStatus = currentStatus;
					currentStatus = status.CHANGE;
					updateState();
					if(previousStatus != currentStatus){
						changeControlsVisibility ('checkAnswers', false, "Check Answer");
						changeControlsVisibility ('checkAnswers', true, "Check Answer");
					}
				},
				destroy: function () {
					
					console.log('destroy event');
					closeConnections();
				},
				checkAnswer: function (eventArgs) {
					currentScore = eventArgs.response.score[0].gotScore;
					currentStatus = status.CHECKED;
					updateState();
					changeControlsVisibility ('hint', false, "Hints");
				},
				reset: function (eventArgs) {
					currentStatus = status.RESET;
					updateState();
				},
				itemNavigation: function( eventArgs ){
					updatedItem = activity.getItem(eventArgs.updatedItem.index);
					changeControlsVisibility ('hint', false, "Hints");
					if(updatedItem.hasHints() && updatedItem.remainingHints()){
						changeControlsVisibility ('hint', true, "Hints");
					}
				},
				error: function (eventArgs) {
					console.log(eventArgs);
				}
			},
			uiStyles: {
				horizontalAlignment: "center"
			}
		}
		

		fetch(jsonPath)
			.then(res => res.json())
			.then(function (itemArr) {
				let baseURL = document.baseURI;
				console.log("baseURL: ", baseURL);
				console.log("document.location.href: ", document.location.href);
				itemArr = itemArr.map( itemPath => baseURL+itemPath);
				LeonardoApp.Activity.init(contentId, itemArr, container, options).then((player) => {
					activity = player;
				});

				LeonardoApp.Activity.render(contentId);
			});

		/*var jsonPath2 = "https://assessment-int-content.s3.us-east-2.amazonaws.com/lo-test-4/data/item_leo.json";
		var jsonPath3 = "https://assessment-int-content.s3.us-east-2.amazonaws.com/lo-test-4/data/item_leo-2.json";
		var jsonPath4 = "https://assessment-int-content.s3.us-east-2.amazonaws.com/lo-test-4/data/mcq_para_example.json";
		var jsonPath5 = "https://assessment-int-content.s3.us-east-2.amazonaws.com/lo-test-4/data/mcq_video_example.json";

		LeonardoApp.Activity.init(contentId, [jsonPath4, jsonPath5, jsonPath2], container, options)
			.then((player) => {
				activity = player;
			});

		LeonardoApp.Activity.render(contentId);*/
		
		
		/*Promise.all([
			fetch(jsonPath4).then(res => res.json()), 
			fetch(jsonPath5).then(res => res.json()), 
			fetch(jsonPath2).then(res => res.json())
		]).then( itemJSONArr => {
			
			

		} )*/
	}

	/* Function to generate statement - started/launched/scored etc.*/
	var generateStatement = function (verb) {
		var statement = {
			verb: {
				"id": "http://adlnet.gov/expapi/verbs/" + verb,
				"display": {
					"und": verb
				}
			},
			object: {
				"id": contentId
			}
		};
		if (verb === 'scored') {
			statement.result = {
				score: {
					max: maxScore,
					min: minScore,
					raw: score,
					scaled: score / maxScore
				}
			}
		}
		var statementsArray = [];
		statementsArray.push(statement);
		newStatements(statementsArray);
	};

	/* DOM Ready event */
	$(document).ready(function () {
		initChannel(
			function (channel) {
				bindChannel(channel);


				/* Get initiliazation paramters - contentPath and state, if any. */
				getInitParameters(function (initParams) {

					contentId = initParams.id || "launchId1";

					loWithoutControls = initParams.hasOwnProperty('loWithoutControls') ? initParams.loWithoutControls : true;
					if (initParams.hasOwnProperty('state') && initParams.state) {
						currentState = initParams.state;
					}

					generateStatement('started');
					launchLeonardoPlayer();

				});
			});
	});

	/*return {
		DOMReady: DOMReady,
		newState: newState,
		newStatements: newStatements,
		changeControlsVisibility: changeControlsVisibility,
		newDimensions: newDimensions
	}*/
})();
  