module.exports = {
    metadata: {
        plugin: "networkStats",
        label: "Network Stats",
        role: "sensor",
        family: "networkStats",
        deviceTypes: ["node-monitor/nodeMonitor"],
        events: [],
        state: [{
            id: "ethernetActive",
            label: "Ethernet active",
            type: {
                id: "boolean"
            }
        }, {
            id: "wifiActive",
            label: "Wifi active",
            type: {
                id: "boolean"
            }
        }, {
            id: "wifiSSID",
            label: "Wifi SSID",
            type: {
                id: "string"
            }
        }, {
            id: "wifiApMAC",
            label: "Wifi access point MAC",
            type: {
                id: "string"
            }
        }, {
            id: "wifiIEEE",
            label: "Wifi IEEE",
            type: {
                id: "string"
            }
        }, {
            id: "wifiFrequency",
            label: "Wifi frequency",
            type: {
                id: "string"
            }
        }, {
            id: "wifiSignalQuality",
            label: "Wifi signal quality",
            type: {
                id: "integer"
            }
        }, {
            id: "localIP",
            label: "Local IP",
            type: {
                id: "string"
            }
        }, {
            id: "publicIP",
            label: "Public IP",
            type: {
                id: "string"
            }
        }, {
            id: "hostname",
            label: "Hostname",
            type: {
                id: "string"
            }
        }, {
            id: "pingTargetAlive",
            label: "Ping Target Alive",
            type: {
                id: "boolean"
            }
        }, {
            id: "pingTime",
            label: "Ping Time",
            type: {
                id: "boolean"
            },
            unit: "ms"
        }],
        configuration: [{
            id: "refreshInterval", //TODO Welcher?
            label: "Refresh Interval",
            type: {
                id: "integer"
            },
            defaultValue: 10,
            unit: "sec"
        }, {
            id: "enablePing",
            label: "Enable Ping",
            typ: {
                id: "boolean"
            },
            defaultValue: false,
        }, {
            id: "pingInterval",
            label: "Ping Interval",
            typ: {
                id: "integer"
            },
            defaultValue: 1,
            unit: "min"
        }, {
            id: "pingTarget",
            label: "Ping Target",
            typ: {
                id: "string"
            },
            defaultValue: "www.thing-it.com",
            unit: "URL/IP"
        },
        ]
    },
    create: function () {
        return new NetworkStats();
    }
};


/**
 *
 */
function NetworkStats() {
    /**
     *
     */
    NetworkStats.prototype.start = function () {

        this.logLevel = 'debug';

        this.state = {};

        let iwconfig = require('wireless-tools/iwconfig');
        let network = require('network');
        let os = require('os');
        let PingMonitor = require('ping-monitor');

        try {
            if (!this.isSimulated()) {

                this.state.hostname = os.hostname();
                this.logDebug("Hostname: " + this.state.hostname);

                if (this.configuration.enablePing) {
                    this.pingMonitor = new PingMonitor({
                        website: this.configuration.pingTarget,
                        interval: this.configuration.pingInterval
                    });

                    this.pingMonitor.on('up', function (res) {
                        this.state.pingTargetAlive = true;
                        this.state.pingTime = res.time;
                        // this.publishEvent(something useful);
                        this.logDebug('Latest Ping to ' + res.website + ' Time: ' + res.time);
                        this.publishStateChange();
                    }.bind(this));


                    this.pingMonitor.on('down', function (res) {
                        this.state.pingTargetAlive = false;
                        // this.publishEvent(something useful);
                        this.logDebug('' + res.website + ' is down! ' + res.statusMessage);
                        this.publishStateChange()
                    }.bind(this));


                    // this event is required to be handled in all Node-Monitor instances
                    this.pingMonitor.on('error', function (res) {
                        this.logDebug('Oh Snap!! An unexpected error occured trying to load ' + res.website + '!');
                        this.pingMonitor.stop();
                        this.publishStateChange()
                        //TODO RESTART INSTANCE?
                    }.bind(this));


                    this.pingMonitor.on('stop', function (website) {
                        this.logDebug(website + ' Ping monitor has stopped.');
                    }.bind(this));

                }

                setInterval(function () {
                    network.get_public_ip(function (err, ip) {
                        this.state.publicIP = (err || ip);
                        this.logDebug("Public IP: " + this.state.publicIP);
                    }.bind(this));
                    network.get_private_ip(function (err, ip) {
                        this.state.localIP = (err || ip);
                        this.logDebug("Local IP: " + this.state.localIP);
                    }.bind(this));

                }.bind(this), 1000); //todo increase


                setInterval(function () {
                    iwconfig.status('wlan0', function (err, wifi) { //Todo no hardcoded interface
                        if (err) {
                            this.wifiActive = false;
                            this.logDebug("No WLAN interface found")
                        } else {

                            this.state.wifiActive = true;
                            this.state.wifiSSID = wifi.ssid;
                            this.state.wifiApMAC = wifi.access_point;
                            this.state.wifiIEEE = wifi.ieee;
                            this.state.wifiFrequency = wifi.frequency;
                            this.state.wifiSignalQuality = wifi.quality;

                            this.logDebug("WIFI Active: " + this.state.wifiActive);
                            this.logDebug("WIFI SSID: " + this.state.wifiSSID);
                            this.logDebug("WIFI AP MAC: " + this.state.wifiApMAC);
                            this.logDebug("WIFI IEEE: " + this.state.wifiIEEE);
                            this.logDebug("WIFI Frequency: " + this.state.wifiFrequency);
                            this.logDebug("WIFI Signal Quality: " + this.state.wifiSignalQuality);
                        }

                        this.publishStateChange();
                    }.bind(this));
                }.bind(this), 1000);


            }
        } catch (x) {
            this.publishMessage("Cannot initialize " + this.device.id + "/"
                + this.id + ":" + x);
        }
    };


    NetworkStats.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    NetworkStats.prototype.setState = function () {
    };

    /**
     *
     */

    NetworkStats.prototype.stop = function () {


    };

    /**
     *
     */
};