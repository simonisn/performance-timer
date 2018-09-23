// Import the Performance Interface from Node.js 'perf_hooks'
import { Performance } from 'perf_hooks';





/**
* Declare variables for Browser Window and Node.js Global.
* NOTE:  "declare" assumes they will be available at runtime.
*/
declare const global: any;   // Node Globals
declare const window: any;   // Browser Window    

class PerformanceLocator {
    public static _performance: Performance;

    public static get performance(): Performance {
        return PerformanceLocator._performance;
    }

    public static initialize(): void {
        PerformanceLocator._performance = PerformanceLocator.locatePerformance();
    }

    /**
     * Get "Performance" High Resolution Time Source 
     * @returns {Performance} Returns the Performance implementation from either the Browser Window or Node.js Globals.
     */      
    private static locatePerformance(): Performance {      
        var performance: Performance;

        /**
         * NOTE:    There isn't really a good way to tell **for sure** if
         *          the current context is the Browser or a Node.js execution
         *          since any execution context can create 'global', 'process', 
         *          'window', or 'document' variables.
         */        
        
        if (typeof global !== 'undefined' && typeof global.process !== 'undefined') {             

            // Get 'performance' from Node.js 'global' object
            performance = require('perf_hooks').performance;

        } else if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
            if(window.performance) {      
        
                // Get 'performance' from the browser's 'window' object
                performance = window.performance;
            }
        }

        return performance;
    }
}

PerformanceLocator.initialize();



/**
 * Interface - IGetTimestamp - represents a function to get a timestamp
 */
interface IGetTimestamp {
    (): number;
}

/**
 * Class - Performance Time Sources
 * 
 * @summary Contains STATIC methods and caching for the Time Source (Timestamps) 
 * and Performance (High Precision Time Source and Browser/Node.js Peformance measurements).
 */
class TimeSource {    

    /**
     * Get a Timestamp
     * @returns {number} Returns a timestamp as a number.
     */
    public static getTimestamp(): number {
        var timeStamp: number;

        if (PerformanceLocator.performance && PerformanceLocator.performance.now) {
            timeStamp = PerformanceLocator.performance.now();
        } else if (Date && Date.now) {
            timeStamp = Date.now();
        } else if (Date && new Date().getTime) {
            timeStamp = new Date().getTime();            
        } else {
            throw new Error("PerformanceTimeSources.getTimeSource(): No Time Source available.");
        }

        return timeStamp;
    }    
}


/**
 * Class - PerformanceTimerExecutionEvent
 * 
 * @summary Contains Start and Stop timestamps and a method to calculate the Run Time Duration.
 */
export class Interval {
    public startTime: number;
    public stopTime: number;
    
    get duration(): number {
        var result = 0;

        if (this.startTime !== 0 && this.stopTime !== 0) {          // PerformanceTimer completed
            result = this.stopTime - this.startTime;
        } else if (this.startTime !== 0 && this.stopTime === 0) {   // PerformanceTime NOT YET completed (return duration to current time)
            result = TimeSource.getTimestamp() - this.startTime;
        }

        return result;
    }

    constructor(startTime: number = 0, stopTime: number = 0) {
        this.startTime = startTime;
        this.stopTime = stopTime;
    }
}

/**
 * Interface - IPerformanceTimerCallback
 * 
 * @summary Defines the callback function used for Performance Timer Start and Stop events.
 */
export interface IPerformanceTimerCallback { (performanceTimer: PerformanceTimer): void; }

/**
 * Enum - Status
 * 
 * @summary Specifies Performance Timer states
 */
export enum Status {    
    started = 'started',
    stopped = 'stopped'
}

/**
 *  Class - PerformanceTimer
 */ 
export class PerformanceTimer {

    /**
     *  Start and Stop suffix used for Performance Marks
     */ 
    private static PERFORMANCE_MARK_START_SUFFIX: string = '-START';
    private static PERFORMANCE_MARK_STOP_SUFFIX: string = '-STOP';

    /**
     * Public Properties
     */
    public readonly id: string;        
    public intervals: Interval[];
    public activeInterval: Interval; 
    
    /**
     * Public Callback Events
     */
    public onStart: IPerformanceTimerCallback;
    public onStop: IPerformanceTimerCallback;        

    /**
     * Private Properties
     */
    private _status: Status;    
    
    /**
     * Constructor
     */
    constructor(args: { id: string, onStart?: IPerformanceTimerCallback, onStop?: IPerformanceTimerCallback }) {
        this.id = args.id;        
        this.onStart = args.onStart;
        this.onStop = args.onStop;                

        this.activeInterval = new Interval();
        this.intervals = new Array<Interval>();        

        this._status = Status.stopped;
    }

    start(): Interval {
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
    }

    stop(): Interval {
        var timeStamp = TimeSource.getTimestamp();

        // Check for multiple calls to Stop
        if(this._status === Status.stopped) {    
            // Create a new ExecutionEvent where Start and Stop times are NOW.        
            this.activeInterval = new Interval(timeStamp, timeStamp);
            this.intervals.push(this.activeInterval);
        } else {
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
    }    

    get status(): Status {
        return this._status;
    }
    
    /* get totalDuration(): number {
        // Map an array of Run Time Duration values
        var durationValues = this.executionEvents.map((value: PerformanceTimerExecutionEvent, index: number, array: Array<PerformanceTimerExecutionEvent>) => {
            return value.duration;
        });

        // Sum Run Time Duration values
        return durationValues.reduce((previousValue: number, currentValue: number, currentIndex: number, array: number[]) => {
            return previousValue + currentValue;
        }, 0);
    } */
}

