const express = require('express');
const body_parser = require('body-parser');
const path = require('path');
const ytdl = require('ytdl-core');
const Speaker = require('speaker');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

// Serve static files from the 'public' directory
app.use('/public', express.static('public'));

let queue = [];

app.get('/', function(reg, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/play', async (req, res) => {
    if (queue.length === 0) {
        res.status(404).send('Queue is empty');
    }

    const video_url = queue.shift();
    const video_id  = getVideoId(video_url);

    try {
        const stream = ytdl(video_id, { filter: 'audioonly' });
        stream.pipe(new Speaker());
        res.status(200).send('Playing audio');
    } catch(error) {
        console.error('Error:', error);
        res.status(500).send('Failed to play audio');
    }
});

app.post('/add-to-queue', (req, res) => {
    const url = req.body.url;
    queue.push(url);
    console.log('URL added to the queue:', url);
    console.log(queue);
    res.redirect('/');
});

function getVideoId(url) {
    const match = url.match(/[?&]v=([^&]+)/);
    return match && match[1];
}

app.listen(PORT, function () {
    console.log(`Coles Orchestral Control Kit listening on port ${PORT}!`);
});