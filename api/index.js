const express = require('express');
const app = express();

// Vercel 会通过环境变量 PORT 提供端口
const PORT = process.env.PORT || 3000;

// 模拟订单数据（实际应存数据库）
let orders = {};

// 获取基础 URL（支持 Vercel 和本地开发）
function getBaseUrl(req) {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    return `${protocol}://${host}`;
}

app.use(express.static('public'));

// 创建代付订单接口
app.get('/create-order', (req, res) => {
    const orderId = Date.now().toString();
    const amount = req.query.amount || 21.9;
    const description = req.query.desc || '代付外卖';

    orders[orderId] = {
        id: orderId,
        amount: amount,
        description: description,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    };

    const baseUrl = getBaseUrl(req);
    res.json({ orderId: orderId, url: `${baseUrl}/pay/${orderId}` });
});

// 代付页面
app.get('/pay/:id', (req, res) => {
    const orderId = req.params.id;
    const order = orders[orderId];

    if (!order || order.status !== 'pending') {
        return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>订单已失效</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
                .error-card { background: #fff; border-radius: 12px; padding: 40px 20px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.08); max-width: 320px; }
                .icon { font-size: 60px; margin-bottom: 15px; }
                h1 { color: #333; margin: 0 0 10px; font-size: 18px; }
                p { color: #999; margin: 0; font-size: 14px; }
                .btn { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #ffb001; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="error-card">
                <div class="icon">😕</div>
                <h1>订单已失效</h1>
                <p>该订单不存在或已过期</p>
                <a href="/" class="btn">返回首页</a>
            </div>
        </body>
        </html>
        `);
    }

    const expiresAt = new Date(order.expiresAt);
    const now = new Date();
    const initialTimeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
    const baseUrl = getBaseUrl(req);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>代付请求 - ¥${order.amount}</title>

        <meta name="description" content="朋友请求您代付${order.amount}元，${order.description}">
        <meta property="og:title" content="代付请求 - ¥${order.amount}">
        <meta property="og:description" content="朋友请求您代付${order.amount}元，${order.description}">
        <meta property="og:image" content="${baseUrl}/wechat-preview.jpg">

        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 15px;
            }
            .container {
                width: 100%;
                max-width: 380px;
            }
            .main-card {
                background: #fff;
                border-radius: 20px;
                padding: 30px 25px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                text-align: center;
            }
            .avatar {
                width: 70px;
                height: 70px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                margin: 0 auto 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
            }
            .title {
                font-size: 20px;
                color: #333;
                margin-bottom: 8px;
                font-weight: 600;
            }
            .subtitle {
                font-size: 14px;
                color: #999;
                margin-bottom: 20px;
            }
            .amount-section {
                background: linear-gradient(135deg, #fff5e6 0%, #fff 100%);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
            }
            .amount-label {
                font-size: 13px;
                color: #999;
                margin-bottom: 5px;
            }
            .amount {
                font-size: 42px;
                color: #ff6b35;
                font-weight: bold;
                line-height: 1;
            }
            .amount small {
                font-size: 20px;
                margin-right: 3px;
            }
            .desc {
                font-size: 14px;
                color: #666;
                margin-bottom: 20px;
                padding: 12px;
                background: #f8f8f8;
                border-radius: 8px;
            }
            .timer-section {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin-bottom: 20px;
            }
            .timer-icon {
                font-size: 16px;
            }
            .timer {
                font-size: 18px;
                color: #ff6b35;
                font-weight: 600;
                font-variant-numeric: tabular-nums;
            }
            .timer-label {
                font-size: 13px;
                color: #999;
            }
            .btn {
                width: 100%;
                padding: 16px;
                border: none;
                border-radius: 12px;
                font-size: 17px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn-primary {
                background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
                color: #fff;
                box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
            }
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
            }
            .btn-primary:active {
                transform: translateY(0);
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                color: rgba(255,255,255,0.8);
                font-size: 12px;
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            .avatar { animation: pulse 2s ease-in-out infinite; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="main-card">
                <div class="avatar">💰</div>
                <div class="title">朋友请求您代付</div>
                <div class="subtitle">感谢您的帮助！</div>

                <div class="amount-section">
                    <div class="amount-label">代付金额</div>
                    <div class="amount"><small>¥</small>${order.amount}</div>
                </div>

                <div class="desc">📋 ${order.description}</div>

                <div class="timer-section">
                    <span class="timer-icon">⏰</span>
                    <span class="timer" id="timer">--:--</span>
                    <span class="timer-label">后过期</span>
                </div>

                <button class="btn btn-primary" onclick="gotoPay()">
                    💳 立即支付
                </button>
            </div>
            <div class="footer">安全支付 · 15分钟有效</div>
        </div>

        <script>
            const initialTimeLeft = ${initialTimeLeft};
            let timeLeft = initialTimeLeft;

            function formatTime(seconds) {
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return mins + ':' + (secs < 10 ? '0' : '') + secs;
            }

            function updateTimer() {
                const timer = document.getElementById('timer');
                timer.textContent = formatTime(timeLeft);

                if (timeLeft <= 300) {
                    timer.style.color = '#ff4444';
                }

                if (timeLeft <= 0) {
                    window.location.href = '/cancel/${orderId}';
                }
                timeLeft--;
            }

            updateTimer();
            setInterval(updateTimer, 1000);

            function gotoPay() {
                window.location.href = '/success/${orderId}';
            }
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// 支付成功回调
app.get('/success/:id', (req, res) => {
    const orderId = req.params.id;
    if (orders[orderId]) {
        orders[orderId].status = 'paid';
    }
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>支付成功</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 15px;
            }
            .container {
                width: 100%;
                max-width: 380px;
                text-align: center;
            }
            .success-icon {
                width: 90px;
                height: 90px;
                background: #fff;
                border-radius: 50%;
                margin: 0 auto 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 50px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                animation: scaleIn 0.5s ease-out;
            }
            .card {
                background: #fff;
                border-radius: 20px;
                padding: 35px 25px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            }
            h1 {
                color: #11998e;
                font-size: 24px;
                margin-bottom: 12px;
            }
            p {
                color: #666;
                font-size: 15px;
                line-height: 1.6;
                margin-bottom: 25px;
            }
            .btn {
                display: inline-block;
                padding: 14px 40px;
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                color: #fff;
                text-decoration: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);
                transition: all 0.3s ease;
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(17, 153, 142, 0.4);
            }
            @keyframes scaleIn {
                from { transform: scale(0); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">✅</div>
            <div class="card">
                <h1>支付成功！</h1>
                <p>感谢您的帮助，已收到款项。<br>您的朋友会非常感激！</p>
                <a href="/" class="btn">返回首页</a>
            </div>
        </div>
    </body>
    </html>
    `);
});

// 取消或超时
app.get('/cancel/:id', (req, res) => {
    const orderId = req.params.id;
    if (orders[orderId]) {
        orders[orderId].status = 'cancelled';
    }
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>订单已取消</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 15px;
            }
            .container {
                width: 100%;
                max-width: 380px;
                text-align: center;
            }
            .cancel-icon {
                width: 90px;
                height: 90px;
                background: #fff;
                border-radius: 50%;
                margin: 0 auto 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 50px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            }
            .card {
                background: #fff;
                border-radius: 20px;
                padding: 35px 25px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            }
            h1 {
                color: #666;
                font-size: 22px;
                margin-bottom: 12px;
            }
            p {
                color: #999;
                font-size: 15px;
                line-height: 1.6;
                margin-bottom: 25px;
            }
            .btn {
                display: inline-block;
                padding: 14px 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
                text-decoration: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="cancel-icon">⏰</div>
            <div class="card">
                <h1>订单已取消</h1>
                <p>该订单已过期或被取消。<br>如需帮助，请联系发起人重新创建订单。</p>
                <a href="/" class="btn">返回首页</a>
            </div>
        </div>
    </body>
    </html>
    `);
});

// Vercel 导出
module.exports = app;
