# libs-frontend-xapi-3 | Launching & Rendering 
Library for implementing a **Container managed** approach for launching, embedding and interacting (data capture) with a xAPI / TinCan compliant learning object. Applications (experience apps) should use this library for setting up a **container** to establish two-way communication channel with an embedded (iframe) LO.

**xAPI LO | Packaging Structure:**

This is assumed to be an externally created/authored package/archive with the following structure. The **index.html** file is a launch point for package **<root>** - which is responsible for automatically rendering/playing the learning object with the following rules & conventions. The **<assets>** folder is optional and typically used for local assets of the LO.

```
<root>
     <assets>
     index.html
```

**xAPI LO | Javascript Interface & Launch Handshake:**

![Container Managed Handshake](doc/container_managed_handshake.png?raw=true "Container Managed Handshake")

The LO (index.html) is responsible for implementing a Javascript interface/handshake for establishing a communication channel with the container. The container (via xAPIRunner) creates the iframe that hosts the LO and loads the index.html. After that the container **waits** for the LO to call ```parent.init``` and returns initParams and then the LO self initializes and eventually calls ```parent.ready```. This informs the container that LO is READY.

**Responsibilities of the LO:**
- Must send ```newStatements``` event whenever new statement/data is available.
- Must send ```newState``` event whenever its internal state changes.
- Must send ```controlsChange``` event whenever any control is to be shown/hidden.
- Must send ```terminated``` event when activity is closed.

## 1. Adding xAPI Runner to your project
Use NPM to install xAPI Runner.
```bash
npm install libs-frontend-xapi-3
```
**Additional Dependencies**
* [JQuery](https://github.com/jquery/jquery) version 3.2.1 or higher.

## 2. Usage
Include xapiRunner in your project (HTML) file as shown below & initialize with appropriate parameters to render your Learning Object or LO.

```html
<html>
  <head>
    <script src="../dist/js/xapirunner-min-0.4.9.js" type="text/javascript" charset="utf-8"></script>
  </head>
  <body>
    <div id="containerLO1"/>
    
    <script language="javascript" type="text/javascript"> 
      //Setup initialization params.
      var initParams = {  
        'paths': {  "dependencyBase" : "https://.../bower_components/" //FQDN path for xAPIRunner dependencies.
         } 
        'userId': '', //Unique User ID
        'productId': '', //Unique Product ID
        'classId': '' //Unique Class ID
      };

      var itemParams = {  
          'learningObject': { 'path': 'https://s3.amazonaws.com/cup-content/IC5_OWB_L0_U01_Ex01',
                              'contentType' : 'ext-cup-xapiscoreable',
                              //Supported types - ext-cup-xapiscoreable
                              'code' : '1519132851151', //Item-code
                              'name': 'IC5_OWB_L0_U01_Ex01', //Optional.
                              'state' : "...........", //Optional state. Use this to Resume previous activity session.
                              'status': '' //String - not_started/in_complete/completed
           },
          //Optionally specify container configurations.
          'container': {
               'type': "generic-content", //Possible types - generic-content
               'config': {
                  'disableLOButtons': false //Boolean. Default value - false.
                }
          }
      };

      //Setup event handlers for receiving events from LO.
      var eventCallbacks = {                
          'newState': function(uniqueId, newState) {/* Do Something */},
          'newStatements': function(uniqueId, newStatements) {/* Do Something */},
          'newInterpretedStatements': function(uniqueId, newInterpretedStatements, newInterpretedVerbs) {/* Do Something */},
          'containerNotification': function(uniqueId, containerEvent, containerEventData) {
               //Example code for container.type = 'generic-content'
               if (containerEvent === 'generic_controls' && containerEventData === 'activityClosed') {
                 //Activity Closed
               } else if (containerEvent === 'generic_controls') {
                  console.log(containerEventData.control);
                  console.log(containerEventData.visible);
                  console.log(containerEventData.meta.buttonText);
               }
           }
      };     
  
     var uniqueLOId = '1519132651151/1519132667943'; // Unique LO Id.
     var containerElementRef = 'containerLO1'; //Unique Container Id.
     var LOInitParams = {}; //Content Initialization object

     // Initialize XAPIRunner Instance & setup event handlers.
     var xapiLO1 = new XAPIRunner(initParams, eventCallbacks, callback);
     // Initialize and paint the activity.
     xapiLO1.paintActivity(uniqueLOId, containerElementRef, itemParams, LOInitParams);
  
     // Call Methods to interact with the LO. eg:
     xapiLO1.containerInvocation(uniqueLOId, 'generic_controls', {type : 'close'});
    </script> 
  </body>
</html>  
  
```

## 3. Events
Events are raised by the LO and can be captured or handled by the container. In order to handle events, the container must setup corresponding event handlers during initialization.

### 3.1 newState
Internal state of the LO has changed. Note, it is the responsibility of the application/container to save the state by handling this event. This is typically used when RESUMING an in-progress activity by sending state in item params.

**Parameters** 
* **id**: Unique Activity Id (used to determine the event generated is corresponding to which activity).
* **state**: String (any format, managed by the LO)

### 3.2 newStatements
One or more new statements have been generated by LO 

**Parameters** 
* **id**: Unique Activity Id (used to determine the event generated is corresponding to which activity).
* **statements**: Array of Statements (JSON)

### 3.3 newInterpretedStatements
One or more new interpreted statements have been generated either by LO or by Container or based on some Business rules. 

**Parameters** 
* **id**: Unique Activity Id (used to determine the event generated is corresponding to which activity).
* **statements**: Array of Interpreted Statements (JSON)

### 3.4 containerNotification 
These are custom events generated by the specific container implementations or types.

**Parameters** 
* **id**: Unique Activity Id (used to determine the event generated is corresponding to which activity).
* **containerEvent**: Event being triggered - generic_controls, container_controls, iframeEvents and size.
* **containerEventData**: Event data being triggered.

#### containerEventData corresponding to different containerEvent :

#### Content custom notifications - 'generic_controls'

**controlsChange**
This event is generated by LOs, informing the container which button to show and when. If state is true, show the button specified in buttonType and vice-versa.

*EventData*
* control: String - Possible values - checkAnswers/sendScores/reviewAnswers/goNext/goPrev. Also event activityClosed is raised when                                            the LO is successfully closed.
* visible: Boolean - Whether to show button or hide. If true call respective funtion of xapirunner on click.
* meta: Object - Conatins key buttonText and type(button).

#### Size notifications - 'size'

**size**
This event is generated by the LOs, informing the container that its internal dimension (rendering size) has changed. The container can handle this event to resize the iframe and avoid scrolling.

*EventData*
* width: String 
* height: String

#### Iframe Events notifications - 'iframeEvents'

**iframeEvents**
This event is generated by the container when some event has been captured.

*EventData*
* event: String (click/touchstart)

#### Container notifications - 'container_controls'

**containerControls**
This event is generated by the container when activity is completed (APP can use this event to show next button to navigate from one LO to another).

*EventData*
* event: String (activityCompleted)

## 4. Methods
Methods used by the container to communicate with the LO.

### 4.1 containerInvocation
This method allow you to invoke the custom methods implemented by specific container.

**Parameters** 
* **id**: Unique Activity Id (used to determine the event generated is corresponding to which activity).
* **containerMethod**: String - Name of the specific container method. For example 'generic_controls' custom method.
* **containerMethodData**: HashMap of custom parameters. For example generic_controls method has parameters - containerMethodData.type (Possible values - checkAnswers/sendScores/reviewAnswers/goNext/goPrev/close)

### 4.2 generateCustomStatement
Generate new custom statement for a particular learning object.

**Parameters** 
* **id**: Unique Activity Id.
* **verb**: Verb for the new statement to be posted (launched/submitted/closed/downloaded/evaluated).
* **options**: JSON object consisting - 'text' and 'audioPath' to be added in the 'submitted' statement object
                                      - 'student_userid', 'link-statementid' 'score' and 'comment' (optional) to be added in the
                                        'evaluated' statement  object. (score : { "scaled": <float>, "min": <float>, "raw": <float>,
                                         "max": <float> })

=======================================
=======================================

# libs-frontend-xapi | Analytics
In addition to launching and rendering, you can also (optionally) send/post the captured statements (and get/post/delete state) to the comproDLS Learning Stack (via Experience APIs).

## 1. Adding xAPI Analytics to your project
Use NPM to install xAPI Analytics.
```bash
npm install libs-frontend-xapi-3
```
**Additional Dependencies**
* [JQuery](https://github.com/jquery/jquery) version 3.2.1 or higher.

## 2. Usage
Include xapiAnalytics in your project (HTML) file as shown below & initialize with appropriate parameters to start communication with the comproDLS Learning Stack.

The following example demonstrate how both ```runner``` and ```analytics``` can be used in coordination. Note, these libraries can be used independent to each other.

```html
<html>
  <head>
    <script src="../dist/js/xapirunner-min-0.4.9.js" type="text/javascript" charset="utf-8"></script>
    <script src="../dist/js/xapianalytics-min-0.4.9.js" type="text/javascript" charset="utf-8"></script>
  </head>
  <body>
    <div id="containerLO1"/>
    
    <script language="javascript" type="text/javascript"> 

      //ANALYTICS - Setup initialization params & initialize analytics engine.
      var serverRoutePrefix = 'xapi-analytics'; //Optional, can be left as BLANK or ''
      var dlsProductId = 'eb377c32-1640-11e8-85c0-0acad1ee5072'; //Mandatory
      var dlsSpaceId = 'user-1340-11e8-8532-0acad1892347'; //Optional
      var dlsClassId = 'ds377c32-1340-11e8-8532-0acad1892347'; //Optional
      var extUserId = 'c5edad5ec7bd490b8d49abce427693fa' //Mandatory
      
      var options = {
        serverRoutePrefix: serverRoutePrefix,
        productId: dlsProductId, 
        spaceId : dlsSpaceId,
        classId: dlsClassId,
        userDetails:{extUserId: extUserId},
        config: { 
            //Optional - Default 20 secs
            'sendStatementInterval': 20 //value in secs
        }
      };
  
      var xapiLO1Analytics = new XAPIAnalytics(options, callback);

      /*
         Note on User Id or Token.
         The Analytics library needs a userid or corresponding token. Due to security best practices
         this information (token) is not passed via the front-end layer and needs to be injected
         on server-side.
      */

      //RUNNER - Setup initialization params.
      var initParams = {  
        'paths': {  "dependencyBase" : "https://.../bower_components/"  //FQDN path for xAPIRunner dependencies.
         },
        'userId': '', //Unique User ID
        'productId': '', //Unique Product ID
        'classId': '' //Unique Class ID
      };

      var itemParams = {  
          'learningObject': { 'path': 'https://s3.amazonaws.com/cup-content/IC5_OWB_L0_U01_Ex01',
                              'contentType' : 'ext-cup-xapiscoreable',
                              //Supported types - ext-cup-xapiscoreable
                              'code' : '1519132851151', //Item-code
                              'name': 'IC5_OWB_L0_U01_Ex01', //Optional.
                              'state' : "...........", //Optional state. Use this to Resume previous activity session.
                              'status': '' //String - not_started/in_complete/completed
           },
          //Optionally specify container configurations.
          'container': {
               'type': "generic-content", //Possible types - generic-content
               'config': {
                  'disableLOButtons': false //Boolean. Default value - false.
                }
          }
      };
  
      var uniqueLOId = '1519132651151/1519132667943'; // Unique LO Id.
      var containerElementRef = 'containerLO1'; //Unique Container Id.

      //STORE DLS Item Code for use all ANALYTICS call.
      var dlsItem = '1519132651151/1519132667943'; 
  
      //RUNNER - Setup event handlers for receiving events from LO.
      var eventCallbacks = {                
          'newState': function(uniqueId, newState) {
               //Persist state to LRS via analytics engine
               xapiLO1Analytics.postState(uniqueId, newState);
          },
          'newInterpretedStatements': function(uniqueId, newInterpretedStatements) {
               //Post Statements to LRS via analytics engine
               xapiLO1Analytics.postStatements(newInterpretedStatements);
               //OR Post Statements without Batching
               xapiLO1Analytics.postStatementsNoBatch(newInterpretedStatements);
          }
      };      

      //RUNNER - Initialize the Activity & setup event handlers.
      var xapiLO1 = new XAPIRunner(initParams, eventCallbacks, callback);
      // Initialize and paint the activity.
      xapiLO1.paintActivity(uniqueLOId, containerElementRef, itemParams, LOInitParams);
      
      //ANALYTICS - Get State
      xapiLO1Analytics.getState(uniqueId);
     //ANALYTICS - Update state  
      xapiLO1Analytics.updateState(uniqueId, stateObject, userId); //userId - optional
      //ANALYTICS - Delete state from LRS
      xapiLO1Analytics.deleteState(uniqueId, userId, key); //userId, key - optional
  
    </script> 
  </body>
</html>  
  
```

### Server-side dependencies & Routes
The Analytics library send AJAX calls to the server under the following assumptions:
* The server is assumed to be on the same origin as the current window source (page url).
* The AJAX calls are authenticated, and it is assumed the container application manages the auth session if needed.
* The following AJAX calls can be sent by the library:

    **MANDATORY**
    ```
    prefix/api/xapi-statements (postStatements) (POST)
    prefix/api/user/product/progress/state/:productId/:itemCode (postState) (POST)
    prefix/api/user/product/progress/state/:productId/:itemCode (getState) (GET)
    ```
   
    OPTIONAL
    ``` 
    prefix/api/user/product/progress/state/:productId/:itemCode (deleteState) (DELETE)
    ```

* The above routes must exist and resolved on the severside
* A helper server-side module is provided `xapi` as a default implementation for these routes. Use the following instructions to use this module in your Express application.
    * Include in the application `require('libs-frontend-xapi-3')` (available in dist)
    * Map the routes and call the respective handlers available in the xapiAnalytics library
    
    ```
    var express = require('express');
    ..
    ..
    // Initiate Express App	
    var app = express();

    ..
    var xapiController = require('libs-frontend-xapi-3').init(comproDLS);
    ..
    app.post('/prefix/api/xapi-statements', xapiController.postStatements.bind(xapiController));
	  app.post('/prefix/api/user/product/progress/state/:productId/:itemCode', xapiController.postState.bind(xapiController));
    app.get('/prefix/api/user/product/progress/state/:productId/:itemCode', xapiController.getState.bind(xapiController));
    app.delete('/prefix/api/user/product/progress/state/:productId/:itemCode', xapiController.deleteState.bind(xapiController));
    
    ```


## 3. Methods
Methods used by the Analytics library to communicate with the comproDLS Learning Stack.

**Note -** It is assumed that the serverside application will have comproDLS userid and orgid (for current logged in user) and this information will not be required to be passed by the front-end (also best practice for security)

### 3.1 postState
Updates user’s Application state for a product. Application state is a set of key-values - fully managed and defined by the client. Typically, this is used by Apps to store custom user progress data / information.

**Parameters** 
* **dlsItem**: comproDLS unique item code of the LO.
* **newState**: New State generated by the LO.

### 3.2 getState
Get user’s Application state for a LO. Application state is a set of key-values - fully managed and defined by the client. Typically, this is used by Apps to get custom user progress data / information to resume the LO.

**Parameters** 
* **dlsItem**: comproDLS unique item code of the LO.

### 3.3 updateState
Updates(appends) user’s Application state for a product. Application state is a set of key-values - fully managed and defined by the client. Typically, this is used by Apps to store custom user progress data / information. Used when teacher has to update state for a student.

**Parameters** 
* **dlsItem**: comproDLS unique item code of the LO
* **newState**: New State generated by the LO.
* **userId**: UserId of the student whose state is being updated.

### 3.4 deleteState
Delete user’s Application state for a LO.

**Parameters** 
* **dlsItem**: comproDLS unique item code of the LO
* **userId**: UserId of the student whose state is being deleted.
* **key**: key to be deleted (optional)

### 3.5 postStatements
Post new statement(s) for a particular learning product. This function batches statements for x secs by storing them in local storage and then posts them. Threshold time x is configurable while initializing xapiAnalytics.

**Parameters** 
* **newStatements**: New Statements generated by the LO.

### 3.6 postStatementsNoBatch
Post new statement(s) for a particular learning product without batching.

**Parameters** 
* **newStatements**: New Statements generated by the LO.

### 3.7 flushStatements
This function posts all the statements present in local storage.
