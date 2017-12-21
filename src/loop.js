/* Copyright (c) 2017 YOPEY YOPEY LLC */

const Events = require('eventemitter3')

class Loop extends Events
{
    /**
     * basic loop support
     * @param {object} [options]
     * @param {number} [options.maxFrameTime=1000/60] maximum time in milliseconds for a frame
     * @param {object} [options.pauseOnBlur] pause loop when app loses focus, start it when app regains focus
     *
     * @event each(elapsed, Loop)
     * @event start(Loop)
     * @event stop(Loop)
     */
    constructor(options)
    {
        super()
        options = options || {}
        this.maxFrameTime = options.maxFrameTime || 1000 / 60
        if (options.pauseOnBlur)
        {
            window.addEventListener('blur', () => this.stopBlur())
            window.addEventListener('focus', () => this.startBlur())
        }
        this.list = []
    }

    /**
     * start requestAnimationFrame() loop
     * @return {Loop} this
     */
    start()
    {
        if (!this.running)
        {
            this.running = true
            this.loop(0)
            this.emit('start', this)
        }
        return this
    }

    /**
     * handler for focus event
     * @private
     */
    startBlur()
    {
        if (this.blurred)
        {
            this.start()
            this.blurred = false
        }
    }

    /**
     * handler for blur event
     * @private
     */
    stopBlur()
    {
        if (this.running)
        {
            this.stop()
            this.blurred = true
        }
    }

    /**
     * stop loop
     * @return {Loop} this
     */
    stop()
    {
        if (this.handle)
        {
            window.cancelAnimationFrame(this.handle)
            this.handle = null
        }
        this.running = false
        this.blurred = false
        this.emit('stop', this)
        return this
    }

    /**
     * loop through updates; can be called manually each frame, or called automatically as part of start()
     * @param {number} elapsed time since last call (will be clamped to this.maxFrameTime)
     */
    update(elapsed)
    {
        const maxFrameTime = this.maxFrameTime
        elapsed = elapsed > maxFrameTime ? maxFrameTime : elapsed
        for (let i = 0, _i = this.list.length; i < _i; i++)
        {
            if (this.list[i].update(elapsed))
            {
                this.list.splice(i, 1)
                i--
                _i--
            }
        }
        this.emit('each', elapsed, this)
    }

    /**
     * internal loop through animations
     * @private
     */
    loop(elapsed)
    {
        if (this.running)
        {
            this.update(elapsed)
            this.handle = requestAnimationFrame((elapsed) => this.loop(elapsed))
        }
    }

    /**
     * adds a callback to the loop
     * @deprecated use add() instead
     * @param {function} callback
     * @param {number} [time=0] in milliseconds to call this update (0=every frame)
     * @param {number} [count=0] number of times to run this update (0=infinite)
     * @return {object} entry - used to remove or change the parameters of the update
     */
    interval(callback, time, count)
    {
        console.warn('yy-loop: interval() deprecated. Use add() instead.')
        this.add(callback, time, count)
    }

    /**
     * adds a callback to the loop
     * @param {function} callback
     * @param {number} [time=0] in milliseconds to call this update (0=every frame)
     * @param {number} [count=0] number of times to run this update (0=infinite)
     * @return {object} entry - used to remove or change the parameters of the update
     */
    add(callback, time, count)
    {
        const entry = new Entry(callback, time, count)
        this.list.push(entry)
        return entry
    }

    /**
     * adds a one-time callback to the loop
     * @param {function} callback
     * @param {number} time in milliseconds to call this update
     * @return {object} entry - used to remove or change the parameters of the update
     */
    timeout(callback, time)
    {
        return this.add(callback, time, 1)
    }

    /**
     * remove a callback from the loop
     * @param {object} entry - returned by add()
     */
    remove(entry)
    {
        const index = this.list.indexOf(entry)
        if (index !== -1)
        {
            this.list.splice(index, 1)
        }
    }

    /**
     * removes all callbacks from the loop
     */
    removeAll()
    {
        this.list = []
    }

    /**
     * @type {number} count of all animations
     */
    get count()
    {
        return this.list.length
    }

    /**
     * @type {number} count of running animations
     */
    get countRunning()
    {
        let count = 0
        for (let entry of this.list)
        {
            if (!entry.pause)
            {
                count++
            }
        }
        return count
    }
}

const Entry = require('./entry')

Loop.entry = Entry
module.exports = Loop