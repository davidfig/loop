# yy-loop
Simple and configurable game/main loop

## features
* emits events (using eventemitter3)
* run every frame or after an interval
* control how many times each function runs
* loop pauses when app loses focus
* uses requestAnimationFrame()

## rationale

This is a replacement for [YY-Update](https://github.com/davidfig/update). I use this in all my games, and as a base class for my other libraries, including [pixi-ease](https://github.com/davidfig/pixi-ease) and [pixi-viewport](https://github.com/davidfig/pixi-ease).

## installation

    npm i yy-loop

## simple example

    const Loop = require('yy-loop')

    const loop = new Loop()

    // add a function to the loop that logs the elapsed time
    loop.add((elapsed) => console.log(elapsed))

    // add a function to the loop that runs ever second for 5 times
    const entry = loop.add((elapsed) => console.log(elapsed), 1000, 5)

    // run each time entry is called
    entry.on('each', () => console.log('It has been one second.'))

    // run after entry is complete
    entry.on('done', () => console.log('completed'))

## live example
https://davidfig.github.io/loop/

## API
### src/loop.js
```
    /**
     * basic loop support
     * note: the default is to stop the loop when app loses focus
     * @param {object} [options]
     * @param {number} [options.maxFrameTime=1000 / 60] maximum time in milliseconds for a frame
     * @param {object} [options.noPause] do not stop loop when app loses focus
     *
     * @event each(elapsed, Loop)
     * @event start(Loop)
     * @event stop(Loop)
     */
    constructor(options)

    /**
     * start requestAnimationFrame() loop
     */
    start()

    /**
     * stop loop
     */
    stop()

    /**
     * loop through updates
     */
    update()

    /**
     * add a callback to the update loop
     * @param {function} callback
     * @param {number} [time=0] in milliseconds to call this update
     * @param {number} [count=0] number of times to run this update (0=infinite)
     * @return {object} entry - used to remove or change the parameters of the update
     */
    add(callback, time, count)

    /**
     * remove a callback from the loop
     * @param {object} entry - returned by add()
     */
    remove(entry)

    /**
     * removes all callbacks from the loop
     */
    removeAll()

    /**
     * @type {number} count of all animations
     */
    get count()

    /**
     * @type {number} count of running animations
     */
    get countRunning()
```
### src/entry.js
```
/** Entry class for Loop */
class Entry extends Events
{
    /**
     * create an entry in the update loop
     * @param {function} callback
     * @param {number} [time=0] in milliseconds to call this update
     * @param {number} [count] number of times to run this update (undefined=infinite)
     */
    constructor(callback, time, count)

    /**
     * update checks time and runs the callback
     * @param {number} elapsed
     * @return {boolean} whether entry is complete and may be removed from list
     */
    update(elapsed)
```
## License  
MIT License  
(c) 2017 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
