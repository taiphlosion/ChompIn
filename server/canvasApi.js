const axios = require('axios');

const canvasApi = axios.create({
    baseURL: 'https://canvas.instructure.com/api/v1', // or your institution's Canvas API base
    headers: {
        Authorization: `Bearer ${process.env.CANVAS_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
    },
});

module.exports = canvasApi;
