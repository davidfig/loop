const Events = require('eventemitter3')

/** Entry class for Loop */
class Entry extends Events
{
    /**
     * create an entry in the update loop
     * used by Loop
     * @param {function} callback
     * @param {number} [time=0] in milliseconds to call this update
     * @param {number} [count] number of times to run this update (undefined=infinite)
     */
    constructor(callback, time, count)
    {
        super()
        this.callback = callback
        this.time = time
        this.current = 0
        this.count = count
    }

    /**
     * run the callback if available
     * @private
     * @param {number} elapsed
     */
    _update(elapsed)
    {
        let result
        if (this.callback)
        {
            result = this.callback(elapsed, this)
        }
        this.emit('each', elapsed, this)
        if (result || (!isNaN(this.count) && !--this.count))
        {
            this.emit('done', this)
            return true
        }
    }

    /**
     * update checks time and runs the callback
     * @param {number} elapsed
     * @return {boolean} whether entry is complete and may be removed from list
     */
    update(elapsed)
    {
        if (!this._pause)
        {
            if (this.time)
            {
                this.current += elapsed
                if (this.current >= this.time)
                {
                    this.current -= this.time
                    return this._update(elapsed)
                }
            }
            else
            {
                return this._update(elapsed)
            }
        }
    }

    /**
     * @type {boolean} pause this entry
     */
    set pause(value)
    {
        this._pause = value
    }
    get pause()
    {
        return this._pause
    }
}

module.exports = Entry