(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mocha", "assert", "./index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var mocha_1 = require("mocha");
    var assert = require("assert");
    var index_1 = require("./index");
    function createTimer(id) {
        var performanceTimer;
        performanceTimer = new index_1.PerformanceTimer({ id: id });
        mocha_1.it('timer id should be ' + id, function () {
            assert.equal(performanceTimer.id, id);
        });
        return performanceTimer;
    }
    function startTimerTests(performanceTimer) {
        var interval;
        mocha_1.it('timer should start', function () {
            interval = performanceTimer.start();
        });
        mocha_1.it('startTime should be non-zero', function () {
            assert.notStrictEqual(interval.startTime, 0);
        });
        mocha_1.it('stopTime should be zero', function () {
            assert.strictEqual(interval.stopTime, 0);
        });
        mocha_1.it('duration should be non-zero', function () {
            assert.notStrictEqual(interval.duration, 0);
        });
        mocha_1.it('status should be started', function () {
            assert.strictEqual(performanceTimer.status, index_1.Status.started);
        });
    }
    function stopTimerTests(performanceTimer) {
        var interval;
        mocha_1.it('timer should stop', function (done) {
            setTimeout(function () {
                interval = performanceTimer.stop();
                done();
            }, 500);
        });
        mocha_1.it('status should be stopped', function () {
            assert.strictEqual(performanceTimer.status, index_1.Status.stopped);
        });
        mocha_1.it('stopTime should return a non-zero value', function () {
            assert.notStrictEqual(interval.stopTime, 0);
        });
        mocha_1.it('duration should return a non-zero value', function () {
            assert.notStrictEqual(interval.duration, 0);
        });
    }
    mocha_1.describe('Create Timer', function () {
        var performanceTimer = createTimer('TIMER_1');
    });
    mocha_1.describe('Start Timer', function () {
        var performanceTimer = createTimer('TIMER_2');
        console.log('Start Timer: performanceTimer', performanceTimer);
        startTimerTests(performanceTimer);
    });
    mocha_1.describe('Start/Stop Timer', function () {
        var performanceTimer = createTimer('TIMER_3');
        mocha_1.describe('Start Timer', function () {
            startTimerTests(performanceTimer);
        });
        mocha_1.describe('Stop Timer', function () {
            stopTimerTests(performanceTimer);
        });
    });
    mocha_1.describe('Restart Timer', function () {
        var performanceTimer = createTimer('TIMER_3');
        mocha_1.describe('First Run', function () {
            mocha_1.describe('Start Timer', function () {
                startTimerTests(performanceTimer);
            });
            mocha_1.describe('Stop Timer', function () {
                stopTimerTests(performanceTimer);
            });
            mocha_1.describe('Post Run', function () {
                mocha_1.it('executionEvents should contain 1 Interval', function () {
                    assert.strictEqual(performanceTimer.intervals.length, 1);
                });
            });
        });
        mocha_1.describe('Second Run', function () {
            mocha_1.describe('Start Timer', function () {
                startTimerTests(performanceTimer);
            });
            mocha_1.describe('Stop Timer', function () {
                stopTimerTests(performanceTimer);
            });
            mocha_1.describe('Post Run', function () {
                mocha_1.it('executionEvents should contain 2 Intervals', function () {
                    assert.strictEqual(performanceTimer.intervals.length, 2);
                });
            });
        });
    });
});
