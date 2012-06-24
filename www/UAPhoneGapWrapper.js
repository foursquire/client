/* =============================================================================

 Name: AirshipPush
 Description: Library wrapper to handle push notifications from UrbanAirship.
 Author: Jason Kadrmas
 Company: KadrmasConcepts LLC

========================================================================== */

var AirshipPush = (function() {
	
	
	var push = {
		
	   init: function() {
		// IMPORTANT: must start notify after device is ready,
	        // otherwise you will not be able to receive the launching notification in callback
	        window.plugins.pushNotification.log("onDeviceReady called");
	        window.plugins.pushNotification.startNotify();	
	        
	        push.registerAPN();
	    },
		
		// register button action
	    registerAPN: function() {
	        window.plugins.pushNotification.log("Registering with APNS via the App Delegate");	
	        window.plugins.pushNotification.register(push.successCallback, push.errorCallback, [{ alert:true, badge:true, sound:true }]);	
	    },
		
		// when APN register succeeded
    	    successCallback: function(e) {
        	window.plugins.pushNotification.log("Device registered. Device token:" + e.deviceToken);
        	
        	push.registerUAPush(e.deviceToken, e.host, e.appKey, e.appSecret);
      	    },
      	
      	   // when APN register failed
      	   errorCallback: function(e) {
	        window.plugins.pushNotification.log('Error during registration: '+e.error);
	      
    	   },
    	
    	   // register urban airship push service after APN is registered successfully
	   registerUAPush: function(deviceToken, host, appKey, appSecret) {
            window.deviceToken = deviceToken;
                   
	        window.plugins.pushNotification.log("Registering with Urban Airship.");
	        window.plugins.pushNotification.log('Registering with Urban Airship Push Service...');
	        
	        var request = new XMLHttpRequest();
	        
	        // open the client and encode our URL
	        request.open('PUT', host+'api/device_tokens/'+deviceToken, true, appKey, appSecret);
	        
	        // callback when request finished
	        request.onload = function() {
	            window.plugins.pushNotification.log('Status: ' + this.status + '<br>');
	            
	            if(this.status == 200 || this.status == 201) {
	                // register UA push success
	                window.plugins.pushNotification.log('UA push service successfully registered.');
	            } else {
	              // error
	                window.plugins.pushNotification.log('Error when registering UA push service.<br>error: '+this.statusText);
	            }
	            
	        };
	
	        request.send();
	    }
    }
    
	
    // Customized callback for receiving notification
    PushNotification.prototype.notificationCallback = function (notification) {
        window.plugins.pushNotification.log("Received a notification.");
        var msg = '';
        for (var property in notification) {
            msg += property + ' : ' + notification[property] + '<br>';
        }
        
        alert(notification['alert']);
        
    };
	
	
    return {
	init: push.init
    };
	
})();