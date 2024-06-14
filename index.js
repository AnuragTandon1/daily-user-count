// const axios = require('axios');
// const nodemailer = require('nodemailer');
// const cron = require('node-cron');

// // Function to fetch CSV file
// async function fetchCSV() {
//     try {
//         const response = await axios.get('http://13.126.173.67:9000/user/exportUser', {
//             responseType: 'stream' // Ensure response type is stream to handle large files
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching CSV:', error);
//         throw error;
//     }
// }

// // Function to send email with CSV attachment
// async function sendEmail(csvData) {
//     try {
//         // Create a Nodemailer transporter
//         const transporter = nodemailer.createTransport({
//             host: 'mail.myshishu.in',
//             port: 465,
//             auth: {
//                 user: 'admin@myshishu.in',
//                 pass: 'Digital123!@#',
//             }
//         });

//         // Compose email
//         const mailOptions = {
//             from: 'admin@myshishu.in',
//             to: 'anuragtandon54321@gmail.com',
//             subject: 'Monthly MIS Report',
//             text: 'Please find the attached MIS file.',
//             attachments: [{
//                 filename: 'exported_users.csv',
//                 content: csvData
//             }]
//         };

//         // Send email
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent:', info.response);
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw error;
//     }
// }

// // Main function to orchestrate the process
// async function main() {
//     try {
//         // Fetch CSV file
//         const csvData = await fetchCSV();

//         // Send email with CSV attachment
//         await sendEmail(csvData);
//     } catch (error) {
//         console.error('Main function error:', error);
//     }
// }

// // Schedule email sending task using node-cron
// cron.schedule('18 12 14 * *', async () => {
//     console.log('Sending email...');
//     await main();
// }, {
//     timezone: 'Asia/Kolkata' // Change timezone as needed
// });
// //myshishuapp@gmail.com
const axios = require('axios');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const csvParser = require('csv-parser');
const { PassThrough } = require('stream');

// Function to fetch CSV file and count rows
async function fetchAndCountCSV() {
    try {
        const response = await axios.get('http://13.126.173.67:9000/user/exportUser', {
            responseType: 'stream' // Ensure response type is stream to handle large files
        });

        return new Promise((resolve, reject) => {
            const stream = response.data.pipe(csvParser());
            let rowCount = 0;

            stream.on('data', () => {
                rowCount++;
            });

            stream.on('end', () => {
                resolve(rowCount);
            });

            stream.on('error', (error) => {
                console.error('Error parsing CSV:', error);
                reject(error);
            });
        });
    } catch (error) {
        console.error('Error fetching CSV:', error);
        throw error;
    }
}

// Function to send email with the row count
async function sendEmail(rowCount) {
    try {
        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: 'mail.myshishu.in',
            port: 465,
            auth: {
                user: 'admin@myshishu.in',
                pass: 'Digital123!@#',
            }
        });

        // Compose email
        const mailOptions = {
            from: 'admin@myshishu.in',
            to: 'anuragtandon54321@gmail.com',
            subject: 'Daily User Count',
            text: `The Daily count of users is: ${rowCount-1}`,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

// Main function to orchestrate the process
async function main() {
    try {
        // Fetch CSV file and count rows
        const rowCount = await fetchAndCountCSV();

        // Send email with the row count
        await sendEmail(rowCount);
    } catch (error) {
        console.error('Main function error:', error);
    }
}

// Schedule email sending task using node-cron
cron.schedule('0 17 * * *', async () => {
    console.log('Sending email...');
    await main();
}, {
    timezone: 'Asia/Kolkata' // Change timezone as needed
});
