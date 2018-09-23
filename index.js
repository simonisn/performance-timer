"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PerformanceLocator = /** @class */ (function () {
    function PerformanceLocator() {
    }
    Object.defineProperty(PerformanceLocator, "performance", {
        get: function () {
            return PerformanceLocator._performance;
        },
        enumerable: true,
        configurable: true
    });
    PerformanceLocator.initialize = function () {
        PerformanceLocator._performance = PerformanceLocator.locatePerformance();
    };
    /**
     * Get "Performance" High Resolution Time Source
     * @returns {Performance} Returns the Performance implementation from either the Browser Window or Node.js Globals.
     */
    PerformanceLocator.locatePerformance = function () {
        var performance;
        /**
         * NOTE:    There isn't really a good way to tell **for sure** if
         *          the current context is the Browser or a Node.js execution
         *          since any execution context can create 'global', 'process',
         *          'window', or 'document' variables.
         */
        if (global && global.process) {
            // Get 'performance' from Node.js 'global' object
            performance = require('perf_hooks').performance;
        }
        else if (window && window.document) {
            if (window.performance) {
                // Get 'performance' from the browser's 'window' object
                performance = window.performance;
            }
        }
        return performance;
    };
    return PerformanceLocator;
}());
PerformanceLocator.initialize();
/**
 * Class - Performance Time Sources
 *
 * @summary Contains STATIC methods and caching for the Time Source (Timestamps)
 * and Performance (High Precision Time Source and Browser/Node.js Peformance measurements).
 */
var TimeSource = /** @class */ (function () {
    function TimeSource() {
    }
    Object.defineProperty(TimeSource, "timeSource", {
        get: function () {
            return TimeSource._timeSource;
        },
        enumerable: true,
        configurable: true
    });
    TimeSource.initialize = function () {
        TimeSource._timeSource = TimeSource.getTimeSource();
    };
    /**
     * Get the Time Source used to get Timestamps
     * @returns {IGetTimestamp} Returns a reference to the function used to get Timestamps.
     */
    TimeSource.getTimeSource = function () {
        var timeSource;
        if (PerformanceLocator.performance && PerformanceLocator.performance.now) {
            timeSource = PerformanceLocator.performance.now;
        }
        else if (Date && Date.now) {
            timeSource = Date.now;
        }
        else if (Date && new Date().getTime) {
            timeSource = function () {
                return new Date().getTime();
            };
        }
        else {
            throw new Error("PerformanceTimeSources.getTimeSource(): No Time Source available.");
        }
        return timeSource;
    };
    /**
     * Get a Timestamp
     * @returns {number} Returns a timestamp as a number.
     */
    TimeSource.getTimestamp = function () {
        var timeSource = TimeSource.timeSource;
        return timeSource && timeSource();
    };
    return TimeSource;
}());
// Initialize the static data
TimeSource.initialize();
/**
 * Class - PerformanceTimerExecutionEvent
 *
 * @summary Contains Start and Stop timestamps and a method to calculate the Run Time Duration.
 */
var Interval = /** @class */ (function () {
    function Interval(startTime, stopTime) {
        if (startTime === void 0) { startTime = 0; }
        if (stopTime === void 0) { stopTime = 0; }
        this.startTime = startTime;
        this.stopTime = stopTime;
    }
    Object.defineProperty(Interval.prototype, "duration", {
        get: function () {
            var result = 0;
            if (this.startTime !== 0 && this.stopTime !== 0) { // PerformanceTimer completed
                result = this.stopTime - this.startTime;
            }
            else if (this.startTime !== 0 && this.stopTime === 0) { // PerformanceTime NOT YET completed (return duration to current time)
                result = TimeSource.getTimestamp() - this.startTime;
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    return Interval;
}());
exports.Interval = Interval;
/**
 * Enum - Status
 *
 * @summary Specifies Performance Timer states
 */
var Status;
(function (Status) {
    Status[Status["started"] = 0] = "started";
    Status[Status["stopped"] = 1] = "stopped";
})(Status = exports.Status || (exports.Status = {}));
/**
 *  Class - PerformanceTimer
 */
var PerformanceTimer = /** @class */ (function () {
    /**
     * Constructor
     */
    function PerformanceTimer(args) {
        this.id = args.id;
        this.onStart = args.onStart;
        this.onStop = args.onStop;
        this.activeInterval = new Interval();
        this.intervals = new Array();
        this._status = Status.stopped;
    }
    PerformanceTimer.prototype.start = function () {
        var timeStamp = TimeSource.getTimestamp();
        // Check for multiple calls to Start
        if (this._status === Status.started) {
            // Stop the current ExecutionEvent
            this.activeInterval.stopTime = timeStamp;
        }
        // Create a new ExecutionEvent
        this.activeInterval = new Interval(timeStamp);
        this.intervals.push(this.activeInterval);
        this._status = Status.started;
        if (PerformanceLocator.performance) {
            PerformanceLocator.performance.mark(this.id + PerformanceTimer.PERFORMANCE_MARK_START_SUFFIX);
        }
        if (this.onStart) {
            this.onStart(this);
        }
        return this.activeInterval;
    };
    PerformanceTimer.prototype.stop = function () {
        var timeStamp = TimeSource.getTimestamp();
        // Check for multiple calls to Stop
        if (this._status === Status.stopped) {
            // Create a new ExecutionEvent where Start and Stop times are NOW.        
            this.activeInterval = new Interval(timeStamp, timeStamp);
            this.intervals.push(this.activeInterval);
        }
        else {
            this.activeInterval.stopTime = timeStamp;
        }
        this._status = Status.stopped;
        if (PerformanceLocator.performance) {
            PerformanceLocator.performance.mark(this.id + PerformanceTimer.PERFORMANCE_MARK_STOP_SUFFIX);
            PerformanceLocator.performance.measure(this.id, this.id + PerformanceTimer.PERFORMANCE_MARK_START_SUFFIX, this.id + PerformanceTimer.PERFORMANCE_MARK_STOP_SUFFIX);
        }
        if (this.onStop) {
            this.onStop(this);
        }
        return this.activeInterval;
    };
    Object.defineProperty(PerformanceTimer.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    /**
     *  Start and Stop suffix used for Performance Marks
     */
    PerformanceTimer.PERFORMANCE_MARK_START_SUFFIX = '-START';
    PerformanceTimer.PERFORMANCE_MARK_STOP_SUFFIX = '-STOP';
    return PerformanceTimer;
}());
exports.PerformanceTimer = PerformanceTimer;
