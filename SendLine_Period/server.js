const express = require('express');
const app = express();
const morgan = require('morgan');
const cron = require('node-cron');
const axios = require('axios');

app.use(morgan('dev'));

const data = ["2025-08-07", "2025-08-08", "2025-08-09"];

// const sendLineNotify = async (message) => {
//     try {
//         await axios.post(
//             'https://notify-api.line.me/api/notify',
//             new URLSearchParams({ message }),
//             {
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                     'Authorization': `Bearer YOUR_LINE_TOKEN`
//                 }
//             }
//         );
//     } catch (err) {
//         console.error('Line Notify error:', err);
//     }
// };

const getTimeInBangkok = async () => {
    const bkkTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(new Date());
    return bkkTime
}

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const sendLineNoti = async () => {
    const today = new Date();
    const todayStr = formatDate(today);

    const tasks = data.map(async item => {
        const itemDate = new Date(item);
        const sevenDaysAgo = new Date(itemDate);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const sevenDaysAgoStr = formatDate(sevenDaysAgo);

        if (sevenDaysAgoStr === todayStr) {
            const msg = `Reminder: 7 days before the customer's scheduled date (${item}) — Today is ${sevenDaysAgoStr}`;
            console.log(msg);
            // await sendLineNotify(msg); // uncomment when ready
        }
    });

    await Promise.all(tasks);
};

const cronSendLineFunction = async () => {

    // cron.schedule('0 10 * * *', async () => {
    //     await sendLineNoti();
    //     console.log(`Cron is working: ran at ${new Date().toLocaleTimeString()} (scheduled for 10:00 AM Asia/Bangkok timezone)`);
    // }, {
    //     timezone: 'Asia/Bangkok'
    // });

    cron.schedule('*/10 * * * * *', async () => {
        const timeInBangkok = await getTimeInBangkok();
        await sendLineNoti();
        console.log(`Cron is working: ran at ${new Date().toLocaleTimeString()} (scheduled for 10:00 AM Asia/Bangkok timezone)`);
        console.log(`Bangkok time is: ${timeInBangkok}`);
    }, {
        timezone: 'Asia/Bangkok'
    }
    );

};

app.listen(3002, () => {
    console.log("Server is Running on Port 3002");
    cronSendLineFunction();
});