import { describe, it} from 'mocha';
import assert = require('assert');
import { PerformanceTimer, Status, Interval } from './index';


function createTimer(id: string): PerformanceTimer {
  var performanceTimer: PerformanceTimer;
 
  performanceTimer = new PerformanceTimer({id: id}); 

  it('timer id should be ' + id, function() {    
    assert.equal(performanceTimer.id, id);
  });

  return performanceTimer;
}

function startTimerTests(performanceTimer: PerformanceTimer) {
  var interval: Interval;

  it('timer should start', function() {
    interval = performanceTimer.start();
  });

  it('startTime should be non-zero', function() {
    assert.notStrictEqual(interval.startTime, 0);
  });  
  
  it('stopTime should be zero', function() {
    assert.strictEqual(interval.stopTime, 0);
  });      

  it('duration should be non-zero', function() {
      assert.notStrictEqual(interval.duration, 0);
  });  
  
  it('status should be started', function() {
    assert.strictEqual(performanceTimer.status, Status.started);
  });       
}

function stopTimerTests(performanceTimer: PerformanceTimer) {    
  var interval: Interval;    

  it('timer should stop', function(done) {
    setTimeout(function() {
      interval = performanceTimer.stop();        

      done();
    }, 500);    
  });

  it('status should be stopped', function() {      
    assert.strictEqual(performanceTimer.status, Status.stopped);
  });    
  
  it('stopTime should return a non-zero value', function() {
    assert.notStrictEqual(interval.stopTime, 0);
  });

  it('duration should return a non-zero value', function() {
    assert.notStrictEqual(interval.duration, 0);
  });  
}





describe('Create Timer', function() { 
  var performanceTimer: PerformanceTimer = createTimer('TIMER_1');
});

describe('Start Timer', function() { 
  var performanceTimer: PerformanceTimer = createTimer('TIMER_2');

  console.log('Start Timer: performanceTimer', performanceTimer);
  
  startTimerTests(performanceTimer);
});

describe('Start/Stop Timer', function() {    
  var performanceTimer: PerformanceTimer = createTimer('TIMER_3');  

  describe('Start Timer', function() {
    startTimerTests(performanceTimer);
  });

  describe('Stop Timer', function() {
    stopTimerTests(performanceTimer);
  });
});

describe('Restart Timer', function() {    
  var performanceTimer: PerformanceTimer = createTimer('TIMER_3');  

  describe('First Run', function() {
    describe('Start Timer', function() {
      startTimerTests(performanceTimer);
    });

    describe('Stop Timer', function() {
      stopTimerTests(performanceTimer);  
    });

    describe('Post Run', function() {
      it('executionEvents should contain 1 ExecutionEvent', function() {
        assert.strictEqual(performanceTimer.intervals.length, 1);
      });
    });
  });
  
  describe('Second Run', function() {
    describe('Start Timer', function() {
      startTimerTests(performanceTimer);
    });

    describe('Stop Timer', function() {
      stopTimerTests(performanceTimer);  
    });

    describe('Post Run', function() {  
      it('executionEvents should contain 2 ExecutionEvent', function() {
        assert.strictEqual(performanceTimer.intervals.length, 2);
      });  
    });
  });    
});