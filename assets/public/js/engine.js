(function() {
    Engine = function() {
        var loWithoutControls = true;
        var currentActivity = null;
        var currentPage = 0;
        var state = {
            "0": {
                "jsonPath": "data/item_mcq.json",
                "activity": null
            },
            "1": {
                "jsonPath": "data/item_mcq2.json",
                "activity": null
            },
            "2": {
                "jsonPath": "data/item_mcq3.json",
                "activity": null
            },
            "3": {
                "jsonPath": "data/item_mcq4.json",
                "activity": null
            },
            "4": {
                "jsonPath": "data/item_mcq5.json",
                "activity": null
            }
        }
        var totalPages = Object.keys(state).length;

        LeonardoApp.register({
            getAuthToken: function(callback) {
              let authJSON = {
                user_id: 'acct-consumer-key',
                time_stamp: 1574918442556,
                token: '0a2f877d7948270dc8a7edc8ad23586385b335443832371d74de64c33bd8bcc6'
              }
              callback(authJSON);
            }
        });

        /* Function to initialize engine */
		var init = function (initParams) {
			contentId = initParams.id;
			adapter = LOAdapter;
			loWithoutControls = initParams.hasOwnProperty('loWithoutControls') ? initParams.loWithoutControls : true;
			generateStatement('started');
			launchMcqPlayer();
        };

        var launchMcqPlayer = function() {
            
              var container = document.getElementById('player-container-'+currentPage);
              
              let options = {
                playerConfig: {
                  uiStyles: { height: 'expand' },
                  buttons: {
                    visible: !loWithoutControls
                  }
                },
                events: {
                    render: function(eventArgs) {
                        adapter.DOMReady();
                        adapter.newState({
                            page: currentPage,
                            totalPages: totalPages
                        });
                    },
                    destroy: function() {
                        console.log('destroy event');
                    }
                }
              }
              
              fetch(state[currentPage].jsonPath)
                .then(res => res.json())
              .then(function(itemJSON) {
                LeonardoApp.Activity.init(currentPage, [itemJSON], container, options).then((player) => {
                    currentActivity = player;
                    state[currentPage].activity = currentActivity;
                    currentActivity.render();
                });
              });
              
              /*fetch("data/item_leo.json")
               .then(res => res.json())
               .then(function(itemJSON) {
               var activityPlayer = LeonardoApp.Activity.init('sandbox', [itemJSON], options);
               LeonardoApp.Activity.render('sandbox', container2);
               LOAdapter.DOMReady();
               LOAdapter.newState({message: 'sample new state'});
               });*/
        }

        var goToNextScreen = function() {
            if(isPageValid(currentPage + 1)) {
                // if(currentActivity) {
                //     currentActivity.destroy();
                //     currentActivity = null;
                // }
                var element = document.getElementById('player-container-'+currentPage);
                element.classList.add('hidden');
                currentPage++;
                element = document.getElementById('player-container-'+currentPage);
                element.classList.remove('hidden');
                if(!state[currentPage].activity) {
                    launchMcqPlayer();
                }
                adapter.newState({
                    page: currentPage,
                    totalPages: totalPages
                });
            }
        }

        var goToPreviousScreen = function() {
            if(isPageValid(currentPage - 1)) {
                var element = document.getElementById('player-container-'+currentPage);
                element.classList.add('hidden');
                currentPage--;
                element = document.getElementById('player-container-'+currentPage);
                element.classList.remove('hidden');
                if(!state[currentPage].activity) {
                    launchMcqPlayer();
                }
                adapter.newState({
                    page: currentPage,
                    totalPages: totalPages
                });
            }
        }

        var isPageValid = function(page) {
            if(page < totalPages && page >= 0) {
                return true;
            }
            return false;
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
			adapter.newStatements(statementsArray);
        };
        
        return {
            init: init,
            goToNextScreen: goToNextScreen,
            goToPreviousScreen: goToPreviousScreen
        }
    }
})();