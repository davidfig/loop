const Loop = require('..')
const FPS = require('yy-fps')

let fps

function test()
{
    // create loop
    const loop = new Loop({ pauseOnBlur: true })
    loop.interval(() => fps.frame())

    // timer that calls function each frame
    let total = 0
    loop.interval(
        function (elapsed)
        {
            total += elapsed
            document.getElementById('elapsed').innerText = Math.round(total)
        })

    // callback with .on() after each 5-second
    let total5 = 0
    const total5Loop = loop.interval(null, 5000)
    total5Loop.on('each',
        function ()
        {
            total5++
            document.getElementById('5s').innerText = total5
        })

    // calls function every 5-seconds for one time
    const total1Loop = loop.interval(null, 5000, 1)
    total1Loop.on('each', () => document.getElementById('one-time').innerText = 'done')

    // calls function every frame for 10 times
    const total10Loop = loop.interval(
        function (elapsed, entry)
        {
            document.getElementById('ten-times').innerText = entry.count
        }, 3000, 10)
    total10Loop.on('done', () => document.getElementById('ten-times').innerText = 'done')

    loop.on('each', (elapsed, loop) => document.getElementById('updates').innerText = loop.count)

    // start loop
    loop.start()
}

window.onload = function ()
{
    fps = new FPS()
    test()

    require('fork-me-github')('https://github.com/davidfig/loop')
    require('./highlight')()
}