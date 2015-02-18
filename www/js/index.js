/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    macAddress: "00:00:12:09:32:96",  // get your mac address from bluetoothSerial.list
    chars: "",


    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {

        app.receivedEvent('deviceready');

        var listPorts = function () {
            // list the available BT ports:
            bluetoothSerial.list(
                function (results) {
                    app.display(JSON.stringify(results));
                },
                function (error) {
                    app.display(JSON.stringify(error));
                }
            );
        }

        // if isEnabled returns failure, this function is called:
        var notEnabled = function () {
            app.display("Bluetooth is not enabled.")
        }

        // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    /*
    Connects if not connected, and disconnects if connected:
*/
    manageConnection: function () {

        

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
            
            // if not connected, do this:
            // clear the screen and display an attempt to connect
            try {
                app.clear();
                app.display("Attempting to connect. " +
                    "Make sure the serial port is open on the target device.");
                // attempt to connect:
                bluetoothSerial.connect(
                    app.macAddress,  // device to connect to
                    app.openPort,    // start listening if you succeed
                    app.showError    // show the error if you fail
                );
            } catch (e) {
                alert('Exception: ' + e.message);
            }
            
            
        };

        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
        var disconnect = function () {
            
            app.display("attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort,     // stop listening to the port
                app.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        
        try {
            bluetoothSerial.isConnected(disconnect, connect);
        }
        catch (e) {
            // statements to handle any exceptions
            alert(e); // pass exception object to error handler
        }
        
        
    },
    /*
        subscribes to a Bluetooth serial listener for newline
        and changes the button:
    */
    openPort: function () {
        
        // if you get a good Bluetooth serial connection:
        
        // change the button's name:
        //connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe('\n', function (data) {
            app.clear();
            app.display(data);
        });
        $('#divFunctions').show();
        $('#divConnect').hide();
    },

    /*
        unsubscribes from any Bluetooth serial listener and changes the button:
    */
    closePort: function () {
        
        // if you get a good Bluetooth serial connection:
        
        // change the button's name:
        //connectButton.innerHTML = "Connect";
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
                function (data) {
                    app.display(data);
                },
                app.showError
        );
        $('#divFunctions').hide();
        $('#divConnect').show();
    },
    /*
        appends @error to the message div:
    */
    showError: function (error) {
        alert('Error: ' + error);
        app.display(error);
    },

    /*
        appends @message to the message div:
    */
    display: function (message) {
        
        return;
        var display = document.getElementById("message"), // the message div
            lineBreak = document.createElement("br"),     // a line break
            label = document.createTextNode(message);     // create the label

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },
    /*
        clears the message div:
    */
    clear: function () {
        var display = document.getElementById("message");
        //display.innerHTML = "";
    },
    
    ClearCmd: function() {
        $('#divCmd').html('');
    },

    Delete: function(i) {

        var names = [];
        var values = [];

        names = JSON.parse(localStorage["names"]);
        values = JSON.parse(localStorage["values"]);

        names.splice(i, 1)
        values.splice(i, 1)

        localStorage["names"] = JSON.stringify(names);
        localStorage["values"] = JSON.stringify(values);

        RestoreFromLocal();        
    },

    DoSend: function(i) {
        var arrVal= JSON.parse(localStorage["values"]);
        
        bluetoothSerial.write(arrVal[i], function () { alert('success'); }, function () { alert('fail'); });
    },

    SendTmp: function() {
        
        bluetoothSerial.write($('#divCmd').html() + 'x', function () { alert('success'); }, function () { alert('fail'); });
    },

    Save: function() {

        if ($('#inpSave').val() == '') {
            alert('enter a name');
            return;
        }
        if ($('#divCmd').html() == '') {
            alert('nothing to save');
            return;
        }

        var names = [];
        var values = [];

        if (localStorage["names"] != undefined) {
            names = JSON.parse(localStorage["names"]);
            values = JSON.parse(localStorage["values"]);
        }
        var len = names.length;
        names[len] = $('#inpSave').val();
        values[len] = $('#divCmd').html() + 'x';

        localStorage["names"] = JSON.stringify(names);
        localStorage["values"] = JSON.stringify(values);

        app.RestoreFromLocal();        
    },

    RestoreFromLocal: function() {
        var xHTML = '';

        if (localStorage["names"] == undefined) return;

        var arr = JSON.parse(localStorage["names"]);
        var arrVal= JSON.parse(localStorage["values"]);

        for (var i = 0; i < arr.length; i++) {
            xHTML += '<div><b>' + arr[i] + '</b>: <span class="dataVal' + i + '">' + arrVal[i] + '</span> <a href="#" onclick="DoSend(' + i + '); return false">send</a> <a href="#" onclick="Delete(' + i + '); return false">delete</a></div>';
        }

        $('#divResult').html(xHTML);
    },

    ToggleMe: function (obj) {
        if ($(obj).hasClass('selected')) {
            $(obj).removeClass('selected');
        } else {
            $(obj).addClass('selected');
        }
    },

    AddCommand: function() {
        var cmd = "00000000";
        $('.selected').each(function() {
            var idx = parseInt($(this).attr('data-id'));
            cmd = app.replaceAt(cmd, idx, '1');
        });
        cmd = 'c' + cmd;
        $('#divCmd').html($('#divCmd').html() + cmd);
    },

    SendRandom: function() {
        var cmd = 'r' + $('#selRnd').val();
        $('#divCmd').html($('#divCmd').html() + cmd);
    },

    SendDelay: function () {
        alert('1');
        if ($('#inpDelay').val() == '') {
            alert('enter number of ms');
            return;
        }
        alert('2');
        if (isNaN($('#inpDelay').val()) || $('#inpDelay').val().indexOf(".") >= 0 || $('#inpDelay').val().indexOf(" ") >= 0) {
            alert('enter whole numbers only');
            return;
        }
        alert('3');
        var cmd = 'd' + pad($('#inpDelay').val(), 5);
        alert('4');
        $('#divCmd').html($('#divCmd').html() + cmd);
        alert('5');
        
    },

    replaceAt: function(str, index, character) {
        return str.substr(0, index) + character + str.substr(index+character.length);
    },

    pad: function (str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }
};
