module.exports = {
    metadata: {
        family: "nodeMonitor",
        superDevice: "node-monitor/nodeMonitor",
        plugin: "nodeMonitor",
        tangible: true,
        label: "Node Monitor",
        connectionTypes: [],
        dataTypes: {},
        actorTypes: [],
        sensorTypes: [],
        services: [],
        state: [{
            id: "raspberryModel",
            label: "Raspberry Pi Model",
            type: {
                id: "string"
            }
        }, {
            id: "hostUpTime",
            label: "Host uptime",
            type: {
                id: "string"
            }
        }, {
            id: "processUpTime",
            label: "Process uptime",
            type: {
                id: "string"
            }
        }, {
            id: "usedCPU",
            label: "Used CPU (%)",
            type: {
                id: "string"
            }
        }, {
            id: "totalMemory",
            label: "Total memory",
            type: {
                id: "string"
            }
        }, {
            id: "usedMemory",
            label: "Used memory",
            type: {
                id: "string"
            }
        }],
        configuration: [{
            label: "Board Type",
            id: "boardType",
            type: {
                family: "reference",
                id: "boardType"
            },
            defaultValue: "RASPBERRY"
        }]
    },


    create: function () {
        return new NodeMonitor();
    }
};

var q = require('q');
var os = require('os');
var cpuinfo = require('proc-cpuinfo')();

//TODO COMPLETE from https://elinux.org/RPi_HardwareHistory
var raspberryRevision = [
    {revision: "Beta", model: "B (Beta)"},
    {revision: "0002", model: "B (Beta)"},
    {revision: "0003", model: "B (Beta)"},
    {revision: "0004", model: "B (Beta)"},
    {revision: "0005", model: "B (Beta)"},
    {revision: "0006", model: "B (Beta)"},
    {revision: "0007", model: "B (Beta)"},
    {revision: "0008", model: "B (Beta)"},
    {revision: "0009", model: "B (Beta)"},
    {revision: "000d", model: "B (Beta)"},
    {revision: "000e", model: "B (Beta)"},
    {revision: "000f", model: "B (Beta)"},
    {revision: "0010", model: "B (Beta)"},
    {revision: "0011", model: "B (Beta)"},
    {revision: "0012", model: "B (Beta)"},
    {revision: "0013", model: "B (Beta)"},
    {revision: "0014", model: "B (Beta)"},
    {revision: "0015", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "Beta", model: "B (Beta)"},
    {revision: "a02082", model: "3 Model B"},

];


function NodeMonitor() {
    /**
     *
     */

    NodeMonitor.prototype.start = function () {
        var deferred = q.defer();

        this.logLevel = 'debug';

        if (this.isSimulated()) {
            deferred.resolve();

        } else {

            //Determinate Raspberry Model
            if (cpuinfo.Revision) {
                try {
                    this.state.raspberryModel = raspberryRevision.find(function (obj) {
                        return obj.revision.includes(cpuinfo.Revision);
                    }).model;

                    this.logDebug("Raspberry Model: " + this.state.raspberryModel);
                } catch (x) {
                    this.state.raspberryModel = 'Not defined yet. Plugin Outdated?';
                    this.logDebug("Raspberry Model: " + this.state.raspberryModel);
                }
            } else {
                this.state.raspberryModel = "-"
            }

            this.state.totalMemory = formatBytes(os.totalmem(), 3);
            this.logDebug("Total Memory: " + this.state.totalMemory);


            setInterval(function () {
                this.state.hostUpTime = getTimeString(os.uptime());
                this.logDebug("Host Uptime: " + this.state.hostUpTime);

                this.state.processUpTime = getTimeString(Math.floor(process.uptime()));
                this.logDebug("Process Uptime: " + this.state.processUpTime);

                this.state.usedMemory = formatBytes(os.totalmem() - os.freemem());
                this.logDebug("Memory: " + this.state.usedMemory + "/" + this.state.totalMemory);

                getCPUUsage(function (v) {
                    let tmp = v * 100;
                    this.state.usedCPU = tmp.toFixed();
                }.bind(this));
                this.logDebug("Used CPU (%): " + this.state.usedCPU);

                this.publishStateChange();
            }.bind(this), 1000); //TODO configurable

            deferred.resolve();
        }
        return deferred.promise;

    };


    /**
     *
     */
    NodeMonitor.prototype.getState = function () {
        return {};
    };

    /**
     *
     */
    NodeMonitor.prototype.setState = function () {
    };

    /**
     *
     */

    NodeMonitor.prototype.stop = function () {


    };

    /**
     *
     */
}

function getCPUUsage(callback, free) {

    let stats1 = getCPUInfo();
    let startIdle = stats1.idle;
    let startTotal = stats1.total;

    setTimeout(function () {
        let stats2 = getCPUInfo();
        let endIdle = stats2.idle;
        let endTotal = stats2.total;

        let idle = endIdle - startIdle;
        let total = endTotal - startTotal;
        let perc = idle / total;

        if (free === true)
            callback(perc);
        else
            callback((1 - perc));

    }, 1000);
}

function getCPUInfo(callback) {
    let cpus = os.cpus();

    let user = 0;
    let nice = 0;
    let sys = 0;
    let idle = 0;
    let irq = 0;
    let total = 0;

    for (let cpu in cpus) {
        if (!cpus.hasOwnProperty(cpu)) continue;
        user += cpus[cpu].times.user;
        nice += cpus[cpu].times.nice;
        sys += cpus[cpu].times.sys;
        irq += cpus[cpu].times.irq;
        idle += cpus[cpu].times.idle;
    }

    total = user + nice + sys + idle + irq;

    return {
        'idle': idle,
        'total': total
    };
}

function formatBytes(bytes, decimals) {
    if (bytes === 0) return '0 Bytes';
    let k = 1024,
        dm = decimals || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


function getTimeString(s) {
    let delim = " ";
    let days = Math.floor(s / 60 / 60 / 24);
    let hours = Math.floor(s / 60 / 60) % 24;
    let minutes = Math.floor(s / 60) % 60;
    let seconds = s % 60;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return days + 'd' + delim + hours + 'h' + delim + minutes + 'm' + delim + seconds + 's';
}