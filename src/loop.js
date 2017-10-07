/* Copyright (c) 2017 YOPEY YOPEY LLC */

const Events = require('eventemitter3')

class Loop extends Events
{
    /**
     * basic loop support
     * note: the default is to stop the loop when app loses focus
     * @param {object} [options]
     * @param {number} [options.maxFrameTime=1000 / 60] maximum time in milliseconds for a frame
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
            window.addEventListener('blur', this.stopBlur.bind(this))
            window.addEventListener('focus', this.startBlur.bind(this))
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
            this.running = performance.now()
            this.update()
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
        this.running = false
        this.blurred = false
        this.emit('stop', this)
        return this
    }

    /**
     * loop through updates
     */
    update()
    {
        if (this.running)
        {
            const now = performance.now()
            let elapsed = now - this.running
            elapsed = elapsed > this.maxFrameTime ? this.maxFrameTime : elapsed
            for (let entry of this.list)
            {
                if (entry.update(elapsed))
                {
                    this.remove(entry)
                }
            }
            this.emit('each', elapsed, this)
            requestAnimationFrame(this.update.bind(this))
        }
    }

    /**
     * add a callback to the update loop
     * @param {function} callback
     * @param {number} [time=0] in milliseconds to call this update
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