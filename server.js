const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { WebSocketServer, WebSocket } = require('ws');
const QRCode = require('qrcode');

const PORT = process.env.PORT || 3000;
const MAX_PLAYERS = 50;
const QUESTION_TIME_LIMIT = 30; // 30 giây mỗi câu

// 12 Câu hỏi chuẩn Liêm Chính Học Thuật (Độ dài các phương án cân bằng tuyệt đối, từ vựng B1)
const questionsMaster = [
    {
        level: "Level 1 — Vòng Bo Cơ Bản",
        levelClass: "level-1-tag",
        question: "Question 1. How can AI help students stay motivated to learn?",
        options: [
            "By doing all homework tasks for them",
            "By giving clear feedback and step-by-step advice",
            "By taking away all difficult learning challenges",
            "By removing the need to read textbooks"
        ],
        correct: 1,
        hint: "AI đóng vai trò như gia sư hướng dẫn (tutor) chứ không phải người làm bài hộ.",
        explanation: "🎯 <strong>Phân tích chiến thuật:</strong> AI tạo động lực học tập tốt nhất khi giải thích dễ hiểu theo nhịp độ của bạn và cho lời khuyên từng bước, chứ không phải làm bài hộ."
    },
    {
        level: "Level 1 — Vòng Bo Cơ Bản",
        levelClass: "level-1-tag",
        question: "Question 2. Which activity best helps you remember new knowledge?",
        options: [
            "Copying notes into your book many times",
            "Reading answer sheets without thinking about them",
            "Testing your own memory before checking answers",
            "Letting AI remember every fact for you"
        ],
        correct: 2,
        hint: "Tự kiểm tra trí nhớ trước khi nhìn đáp án giúp não ghi nhớ sâu nhất.",
        explanation: "🎯 <strong>Phân tích chiến thuật:</strong> Tự nhớ lại trước khi xem đáp án (Retrieval Practice) bắt não bộ phải hoạt động tích cực, giúp nhớ lâu hơn nhiều so với việc chép bài thụ động."
    },
    {
        level: "Level 1 — Vòng Bo Cơ Bản",
        levelClass: "level-1-tag",
        question: "Question 3. What is the most honest way to use AI for an essay?",
        options: [
            "Copy AI sentences directly into your final paper",
            "Ask AI to write the whole assignment quickly",
            "Submit AI text without reading it carefully first",
            "Use AI for ideas and write your own essay"
        ],
        correct: 3,
        hint: "Liêm chính học thuật: Dùng AI gợi mở ý tưởng, nhưng bạn phải tự viết bài.",
        explanation: "🎯 <strong>Phân tích chiến thuật:</strong> Sử dụng AI trung thực là dùng nó để tìm gợi ý và hiểu bài, sau đó bạn phải tự tay viết và diễn đạt bằng suy nghĩ của chính mình."
    },
    {
        level: "Level 2 — Vòng Bo Hiếm",
        levelClass: "level-2-tag",
        question: "Question 4. Why can depending too much on AI weaken your learning?",
        options: [
            "AI always gives wrong answers to simple questions",
            "You practice less independent thinking and problem solving",
            "AI stops students from using computers and phones",
            "Digital tools make students forget how to read"
        ],
        correct: 1,
        hint: "Não bộ cần được rèn luyện: Ỷ lại vào AI làm giảm khả năng tự tư duy.",
        explanation: "🎯 <strong>Phân tích chiến thuật:</strong> Khi để AI trả lời hộ mọi thứ, bạn sẽ ít có cơ hội tự suy nghĩ và tự giải quyết vấn đề, khiến não bộ mất đi phản xạ tư duy độc lập."
    },
    {
        level: "Level 2 — Vòng Bo Hiếm",
        levelClass: "level-2-tag",
        question: "Question 5. Why is your memory still needed when AI stores facts?",
        options: [
            "Students must memorize every fact on the internet",
            "AI computers can only save tiny amounts of information",
            "Basic knowledge helps you check if AI answers are true",
            "Human memory is always correct while AI always fails"
        ],
        correct: 2,
        hint: "Phải có kiến thức trong đầu thì mới biết AI nói thật hay nói dối.",
        explanation: "🎯 <strong>Phân tích chiến thuật:</strong> Kiến thức trong đầu giúp bạn nhận ra lỗi sai hoặc thông tin bịa đặt của AI. Nếu không có kiến thức nền, bạn sẽ dễ dàng tin vào thông tin sai."
    },
    {
        level: "Level 2 — Vòng Bo Hiếm",
        levelClass: "level-2-tag",
        question: "Question 6. Which study method helps you remember lessons for months?",
        options: [
            "Asking AI to summarize a whole book once",
            "Reading the same summary many times without testing",
            "Using AI quizzes to test your memory regularly",
            "Memorizing AI answers right before the final exam"
        ],
        correct: 2,
        hint: "Tự làm quiz lặp lại nhiều lần giúp đánh bại sự lãng quên.",
        explanation: "🎯 <strong>Phân tích chiến thuật:</strong> Dùng AI tạo câu đố để tự kiểm tra định kỳ (Spaced Practice) giúp chuyển kiến thức vào trí nhớ dài hạn hiệu quả nhất."
    },
    {
        level: "Level 3 — Vòng Bo Sử Thi",
        levelClass: "level-3-tag",
        question: "Question 7. A lesson is too hard for a student. How should they use AI?",
        options: [
            "Ask AI to solve every exercise in that lesson",
            "Ask AI to explain simply, then practice by themselves",
            "Copy AI answers without trying to understand the lesson",
            "Stop studying and look only at very easy topics"
        ],
        correct: 1,
        hint: "Chia nhỏ bài khó: Nhờ AI giải thích đơn giản rồi tự tay làm bài tập.",
        explanation: "🎯 <strong>Phân tích chiến thuật:</strong> Yêu cầu AI chia nhỏ khái niệm phức tạp thành các bước dễ hiểu, sau đó bạn phải tự tay làm bài tập để thực sự nắm vững kiến thức."
    },
    {
        level: "Level 3 — Vòng Bo Sử Thi",
        levelClass: "level-3-tag",
        question: "Question 8. A student makes AI flashcards but always looks at answers first. What is wrong?",
        options: [
            "They should stop using flashcards for their study",
            "They must read the answers faster every single day",
            "They should try to remember before seeing the answer",
            "They should let AI memorize facts for their exam"
        ],
        correct: 2,
        hint: "Nhìn đáp án trước chỉ làm bạn ngộ nhận là mình đã thuộc.",
        explanation: "🎯 <strong>Phân tích chiến thuật:</strong> Đọc đáp án trước tạo ra ảo tưởng là mình đã hiểu. Cần phải cố gắng tự nhớ lại câu trả lời trước khi lật mặt sau flashcard."
    },
    {
        level: "Level 3 — Vòng Bo Sử Thi",
        levelClass: "level-3-tag",
        question: "Question 9. AI writes an essay with book references. What should you do first?",
        options: [
            "Trust the text because it looks very smart",
            "Check if those book titles and authors really exist",
            "Copy all references without searching for the books",
            "Assume that smart grammar always means true facts"
        ],
        correct: 1,
        hint: "AI rất hay bịa ra tên sách và tác giả không có thật.",
        explanation: "🎯 <strong>Phân tích chiến thuật:</strong> AI thường tự tạo ra các trích dẫn giả mạo (ảo giác AI). Phải luôn kiểm tra trên Google Scholar hoặc thư viện xem nguồn đó có thật hay không."
    },
    {
        level: "Level 4 — Vòng Bo Huyền Thoại",
        levelClass: "level-4-tag",
        question: "Question 10. Student A reads AI notes. Student B tests memory and fixes errors. Why is B better?",
        options: [
            "AI summaries never have enough details for good students",
            "Reading summaries is always bad for any school subject",
            "Testing your memory and fixing mistakes build stronger learning",
            "Student B studies less so their brain stays fresh"
        ],
        correct: 2,
        hint: "Học chủ động và sửa lỗi sai giúp não bộ ghi nhớ tốt hơn đọc lướt.",
        explanation: "🎯 <strong>Phân tích chiến thuật:</strong> Tự kiểm tra trí nhớ và sửa lỗi sai giúp não bộ kết nối kiến thức bền vững, hiệu quả hơn nhiều so với việc chỉ đọc thụ động."
    },
    {
        level: "Level 4 — Vòng Bo Huyền Thoại",
        levelClass: "level-4-tag",
        question: "Question 11. You have one hour before an exam. What is the best AI study plan?",
        options: [
            "Ask AI to predict questions and memorize its answers",
            "Find main points, test your memory, and fix mistakes",
            "Read long AI notes continuously without any quick breaks",
            "Search every website online without doing any practice tests"
        ],
        correct: 1,
        hint: "Kế hoạch 1 giờ: Tóm tắt ý chính -> Tự kiểm tra -> Sửa lỗi sai.",
        explanation: "🎯 <strong>Phân tích chiến thuật:</strong> Dùng AI tìm ra các khái niệm trọng tâm, tự kiểm tra kiến thức của mình và tập trung ôn lại phần mình hay làm sai."
    },
    {
        level: "Level 4 — Vòng Bo Huyền Thoại",
        levelClass: "level-4-tag",
        question: "Question 12. What is the best university rule for using AI in student study?",
        options: [
            "Ban every AI tool in all university learning activities",
            "Allow students to submit AI work with no explanation",
            "Forbid all digital devices and allow only paper books",
            "Use AI for learning help, but show your own thinking"
        ],
        correct: 3,
        hint: "Chính sách tiến bộ: Được dùng AI để hỗ trợ học, nhưng phải tự tư duy.",
        explanation: "🎯 <strong>Phân tích chiến thuật:</strong> Quy định giáo dục tốt nhất là cho phép sinh viên dùng AI để giải thích và học hỏi, nhưng bài nộp phải chứng minh được tư duy độc lập của chính bạn."
    }
];

// Tìm địa chỉ IPv4 cục bộ (Wi-Fi hoặc LAN)
function getLocalIp() {
    const ifaces = os.networkInterfaces();
    for (const dev in ifaces) {
        for (const details of ifaces[dev]) {
            if (details.family === 'IPv4' && !details.internal) {
                return details.address;
            }
        }
    }
    return 'localhost';
}

const localIp = getLocalIp();
const clientUrl = `http://${localIp}:${PORT}`;

// Game State Server
let gameState = 'LOBBY'; // 'LOBBY' | 'QUESTION_ACTIVE' | 'QUESTION_REVEALED' | 'FINISHED'
let currentQuestionIdx = 0;
let questionStartTime = 0;
let questionServerTimer = null;
let currentSubmissions = new Map(); // playerId -> { selectedIdx, timeSpent }

const players = new Map(); // playerId -> Player Object
let hostSocket = null;
let qrCodeDataUrl = '';

// Khởi tạo mã QR
QRCode.toDataURL(clientUrl, { width: 340, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
    .then(url => { qrCodeDataUrl = url; })
    .catch(err => console.error('Lỗi tạo QR:', err));

// HTTP Server
const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];

    if (reqUrl === '/api/info') {
        const urlParams = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const paramUrl = urlParams.searchParams.get('url');

        const protocol = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http');
        const hostHeader = req.headers['x-forwarded-host'] || req.headers.host || `${localIp}:${PORT}`;
        const effectiveClientUrl = paramUrl || process.env.RENDER_EXTERNAL_URL || `${protocol}://${hostHeader}`;

        QRCode.toDataURL(effectiveClientUrl, { width: 340, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
            .then(qr => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    hostIp: localIp,
                    port: PORT,
                    clientUrl: effectiveClientUrl,
                    qrCode: qr,
                    maxPlayers: MAX_PLAYERS,
                    playerCount: players.size,
                    gameState: gameState,
                    currentQuestionIdx: currentQuestionIdx,
                    totalQuestions: questionsMaster.length
                }));
            })
            .catch(() => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    hostIp: localIp,
                    port: PORT,
                    clientUrl: effectiveClientUrl,
                    qrCode: qrCodeDataUrl,
                    maxPlayers: MAX_PLAYERS,
                    playerCount: players.size,
                    gameState: gameState,
                    currentQuestionIdx: currentQuestionIdx,
                    totalQuestions: questionsMaster.length
                }));
            });
        return;
    }

    let filePath = path.join(__dirname, 'public', reqUrl === '/' ? 'index.html' : reqUrl);
    if (reqUrl === '/host') filePath = path.join(__dirname, 'public', 'host.html');
    if (reqUrl === '/freefire.html') filePath = path.join(__dirname, 'public', 'index.html');

    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Không tìm thấy trang.');
            } else {
                res.writeHead(500);
                res.end(`Lỗi server: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// WebSocket Server
const wss = new WebSocketServer({ server });

function broadcastToAll(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

function sendToHost(data) {
    if (hostSocket && hostSocket.readyState === WebSocket.OPEN) {
        hostSocket.send(JSON.stringify(data));
    }
}

// Đếm tổng số người chơi còn sống trong trận đấu
function getActiveParticipantsCount() {
    let count = 0;
    players.forEach(p => {
        if (!p.eliminated) count++;
    });
    return count;
}

function getPlayerListSummary() {
    const list = [];
    players.forEach(p => {
        list.push({
            id: p.id,
            name: p.name,
            charIdx: p.charIdx,
            score: p.score,
            hp: p.hp,
            streak: p.streak,
            eliminated: p.eliminated,
            connected: p.connected,
            totalSpeedBonus: p.totalSpeedBonus,
            correctCount: p.correctCount,
            totalTimeSpent: Number(p.totalTimeSpent.toFixed(2))
        });
    });
    return list;
}

function getSortedLeaderboard() {
    const list = getPlayerListSummary();
    list.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.hp !== a.hp) return b.hp - a.hp;
        return a.totalTimeSpent - b.totalTimeSpent;
    });
    return list;
}

// Bắt đầu một câu hỏi đồng bộ
function startSynchronizedQuestion(qIdx) {
    if (qIdx >= questionsMaster.length) {
        finishMatch();
        return;
    }

    currentQuestionIdx = qIdx;
    gameState = 'QUESTION_ACTIVE';
    currentSubmissions.clear();
    questionStartTime = Date.now();

    const q = questionsMaster[qIdx];
    const totalActive = getActiveParticipantsCount();

    // Phát câu hỏi cho cả phòng (KHÔNG GỬI ĐÁP ÁN ĐÚNG để chống gian lận)
    broadcastToAll({
        type: 'QUESTION_START',
        questionIdx: qIdx,
        totalQuestions: questionsMaster.length,
        level: q.level,
        levelClass: q.levelClass,
        questionText: q.question,
        options: q.options,
        hint: q.hint,
        timeLimit: QUESTION_TIME_LIMIT,
        activePlayers: totalActive
    });

    console.log(`[ROUND] Bắt đầu Câu ${qIdx + 1}/${questionsMaster.length} (Có ${totalActive} người chơi còn sống).`);

    // Đồng hồ 30 giây trên server
    if (questionServerTimer) clearInterval(questionServerTimer);
    let secondsLeft = QUESTION_TIME_LIMIT;

    questionServerTimer = setInterval(() => {
        secondsLeft--;

        // Kiểm tra điều kiện khui đáp:
        // ĐIỀU KIỆN 1: Nếu có từ 2 người trở lên và TẤT CẢ đã nộp xong -> Khui đáp ngay
        const activeCount = getActiveParticipantsCount();
        if (activeCount >= 2 && currentSubmissions.size >= activeCount) {
            clearInterval(questionServerTimer);
            console.log(`[ROUND] Toàn bộ ${activeCount}/${activeCount} người chơi đã hoàn thành! Khui đáp án ngay.`);
            revealQuestionResults();
            return;
        }

        // ĐIỀU KIỆN 2: Hết thời gian 30s -> Bắt buộc khui đáp
        if (secondsLeft <= 0) {
            clearInterval(questionServerTimer);
            console.log(`[ROUND] Hết thời gian 30s câu ${qIdx + 1}! Khui đáp án cho cả lớp.`);
            revealQuestionResults();
        }
    }, 1000);
}

// Kiểm tra xem có đủ điều kiện khui đáp sớm không
function checkEarlyReveal() {
    const activeCount = getActiveParticipantsCount();
    // CHỈ khui đáp sớm khi có ít nhất 2 người và TẤT CẢ các thành viên trong phòng đều đã nộp bài
    if (activeCount >= 2 && currentSubmissions.size >= activeCount) {
        if (questionServerTimer) clearInterval(questionServerTimer);
        console.log(`[ROUND] Tất cả ${activeCount} người chơi đã nộp bài xong sớm! Khui đáp án.`);
        revealQuestionResults();
    }
}

// Công bố đáp án và tính điểm cho tất cả người chơi đồng loạt
function revealQuestionResults() {
    if (gameState === 'QUESTION_REVEALED') return;
    gameState = 'QUESTION_REVEALED';

    const q = questionsMaster[currentQuestionIdx];
    const correctIdx = q.correct;

    const stats = { 0: 0, 1: 0, 2: 0, 3: 0, timeout: 0 };
    const playerResultsMap = {};

    players.forEach(p => {
        const sub = currentSubmissions.get(p.id);
        let isCorrect = false;
        let timeSpent = QUESTION_TIME_LIMIT;
        let roundScore = 0;
        let speedBonus = 0;
        let streakBonus = 0;
        let hpDeducted = 0;

        if (sub !== undefined && sub.selectedIdx !== null) {
            stats[sub.selectedIdx] = (stats[sub.selectedIdx] || 0) + 1;
            timeSpent = sub.timeSpent;
            p.totalTimeSpent += timeSpent;

            if (sub.selectedIdx === correctIdx) {
                isCorrect = true;
                p.correctCount++;

                // ĐIỂM TỐC ĐỘ: Cơ bản 100đ + Tối đa 50đ dựa trên số giây còn lại
                const basePoints = 100;
                const remainingSec = Math.max(0, QUESTION_TIME_LIMIT - timeSpent);
                speedBonus = Math.round((remainingSec / QUESTION_TIME_LIMIT) * 50);
                streakBonus = p.streak * 10;

                roundScore = basePoints + speedBonus + streakBonus;
                p.score += roundScore;
                p.streak++;
                p.totalSpeedBonus += speedBonus;
            } else {
                isCorrect = false;
                p.streak = 0;
                hpDeducted = 25;
                p.hp = Math.max(0, p.hp - hpDeducted);
                if (p.hp <= 0) p.eliminated = true;
            }
        } else {
            // Hết giờ chưa chọn
            stats.timeout = (stats.timeout || 0) + 1;
            p.totalTimeSpent += QUESTION_TIME_LIMIT;
            p.streak = 0;
            hpDeducted = 25;
            p.hp = Math.max(0, p.hp - hpDeducted);
            if (p.hp <= 0) p.eliminated = true;
        }

        playerResultsMap[p.id] = {
            selectedIdx: sub ? sub.selectedIdx : null,
            isCorrect: isCorrect,
            timeSpent: Number(timeSpent.toFixed(2)),
            speedBonus: speedBonus,
            streakBonus: streakBonus,
            roundScore: roundScore,
            newScore: p.score,
            newHp: p.hp,
            streak: p.streak,
            eliminated: p.eliminated
        };
    });

    const leaderboard = getSortedLeaderboard();

    // Phát kết quả đồng thời cho toàn bộ Client và Host
    broadcastToAll({
        type: 'QUESTION_REVEAL',
        questionIdx: currentQuestionIdx,
        correctIdx: correctIdx,
        explanation: q.explanation,
        stats: stats,
        playerResults: playerResultsMap,
        leaderboard: leaderboard
    });
}

// Kết thúc toàn bộ trận đấu (Booyah Celebration)
function finishMatch() {
    gameState = 'FINISHED';
    if (questionServerTimer) clearInterval(questionServerTimer);

    const finalLeaderboard = getSortedLeaderboard();
    broadcastToAll({
        type: 'MATCH_FINISHED',
        finalLeaderboard: finalLeaderboard
    });
    console.log('[MATCH] Trận đấu kết thúc hoàn toàn. Đã tìm ra Nhà Vô Địch Booyah!');
}

// WebSocket Connection Router
wss.on('connection', (ws) => {
    let currentSocketPlayerId = null;

    ws.on('message', (messageText) => {
        let msg = null;
        try { msg = JSON.parse(messageText); } catch (e) { return; }

        // 1. HOST KẾT NỐI
        if (msg.type === 'REGISTER_HOST') {
            hostSocket = ws;
            ws.send(JSON.stringify({
                type: 'HOST_CONNECTED_ACK',
                clientUrl: clientUrl,
                localIp: localIp,
                port: PORT,
                qrCode: qrCodeDataUrl,
                gameState: gameState,
                maxPlayers: MAX_PLAYERS,
                currentQuestionIdx: currentQuestionIdx,
                players: getPlayerListSummary(),
                leaderboard: getSortedLeaderboard()
            }));
            return;
        }

        // 2. CLIENT VÀO SẢNH CHỜ (YÊU CẦU BẮT BUỘC CÓ TÊN)
        if (msg.type === 'JOIN_LOBBY') {
            const rawName = (msg.name || '').trim();

            if (!rawName || rawName.length < 2) {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    message: '⚠️ Bạn bắt buộc phải nhập họ và tên của mình (tối thiểu 2 ký tự) để tham gia thi đấu!'
                }));
                return;
            }

            if (players.size >= MAX_PLAYERS) {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    message: `Phòng đã đầy (${MAX_PLAYERS}/${MAX_PLAYERS} người)!`
                }));
                return;
            }

            if (gameState !== 'LOBBY') {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    message: 'Trận đấu đang diễn ra! Vui lòng chờ trận tiếp theo.'
                }));
                return;
            }

            const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
            currentSocketPlayerId = playerId;

            const newPlayer = {
                id: playerId,
                ws: ws,
                name: rawName.substring(0, 25),
                charIdx: Number(msg.charIdx) || 0,
                score: 0,
                hp: 100,
                streak: 0,
                correctCount: 0,
                totalSpeedBonus: 0,
                totalTimeSpent: 0,
                eliminated: false,
                connected: true,
                joinedAt: Date.now()
            };

            players.set(playerId, newPlayer);

            ws.send(JSON.stringify({
                type: 'JOINED_SUCCESS',
                playerId: playerId,
                player: { id: newPlayer.id, name: newPlayer.name, charIdx: newPlayer.charIdx },
                totalPlayers: players.size,
                maxPlayers: MAX_PLAYERS
            }));

            broadcastToAll({
                type: 'LOBBY_UPDATE',
                playerCount: players.size,
                maxPlayers: MAX_PLAYERS,
                players: getPlayerListSummary()
            });

            console.log(`[LOBBY] Sinh viên "${newPlayer.name}" đã vào sảnh chờ. Hiện có: ${players.size}/${MAX_PLAYERS}`);
            return;
        }

        // 3. HOST PHÁT LỆNH BẮT ĐẦU TRẬN ĐẤU (START MATCH)
        if (msg.type === 'HOST_START_MATCH') {
            if (players.size === 0) {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    message: 'Chưa có người chơi nào trong sảnh chờ để bắt đầu!'
                }));
                return;
            }

            console.log(`[MATCH] Máy chủ phát lệnh đếm ngược 3s cho ${players.size} người chơi!`);
            broadcastToAll({
                type: 'MATCH_START_COUNTDOWN',
                countdown: 3,
                totalPlayers: players.size
            });

            setTimeout(() => {
                startSynchronizedQuestion(0);
            }, 3500);
            return;
        }

        // 4. CLIENT NỘP ĐÁP ÁN (SUBMIT ANSWER)
        if (msg.type === 'SUBMIT_ANSWER') {
            const pId = msg.playerId || currentSocketPlayerId;
            const player = players.get(pId);
            if (!player || gameState !== 'QUESTION_ACTIVE') return;

            if (currentSubmissions.has(pId)) return;

            const timeSpent = Math.min(QUESTION_TIME_LIMIT, Math.max(0.1, (Date.now() - questionStartTime) / 1000));
            const selectedIdx = (msg.selectedIdx !== null && msg.selectedIdx !== undefined) ? Number(msg.selectedIdx) : null;

            currentSubmissions.set(pId, {
                selectedIdx: selectedIdx,
                timeSpent: timeSpent
            });

            // Gửi xác nhận cho riêng người chơi này: ĐÃ KHÓA ĐÁP ÁN (CHƯA CÔNG BỐ ĐÁP ÁN ĐÚNG)
            ws.send(JSON.stringify({
                type: 'ANSWER_LOCKED',
                selectedIdx: selectedIdx,
                timeSpent: Number(timeSpent.toFixed(2))
            }));

            const totalActive = getActiveParticipantsCount();
            const submittedCount = currentSubmissions.size;

            // Báo tiến độ nộp bài cho cả lớp và Host
            broadcastToAll({
                type: 'SUBMISSION_PROGRESS',
                submittedCount: submittedCount,
                totalAlive: totalActive,
                latestSubmitName: player.name
            });

            console.log(`[SUBMIT] ${player.name} đã chốt đáp án (${submittedCount}/${totalActive} đã nộp - ${timeSpent.toFixed(1)}s).`);

            // Kiểm tra xem đã đủ điều kiện khui đáp sớm chưa (chỉ khi có >= 2 người và TẤT CẢ đã nộp)
            checkEarlyReveal();
            return;
        }

        // 5. HOST ÉP KHUI ĐÁP ÁN NGAY (FORCE REVEAL)
        if (msg.type === 'HOST_FORCE_REVEAL') {
            if (gameState === 'QUESTION_ACTIVE') {
                if (questionServerTimer) clearInterval(questionServerTimer);
                console.log('[HOST] Máy chủ đã bấm ép khui đáp án ngay lập tức!');
                revealQuestionResults();
            }
            return;
        }

        // 6. HOST PHÁT LỆNH SANG CÂU TIẾP THEO (NEXT QUESTION)
        if (msg.type === 'HOST_NEXT_QUESTION') {
            if (gameState !== 'QUESTION_REVEALED') return;
            startSynchronizedQuestion(currentQuestionIdx + 1);
            return;
        }

        // 7. HOST KHỞI ĐỘNG LẠI PHÒNG (RESET LOBBY)
        if (msg.type === 'HOST_RESET_LOBBY') {
            if (questionServerTimer) clearInterval(questionServerTimer);
            gameState = 'LOBBY';
            currentQuestionIdx = 0;
            currentSubmissions.clear();
            questionStartTime = 0;

            // XÓA TOÀN BỘ NGƯỜI CHƠI ĐÃ CHƠI KHỎI SẢNH (về 0/50)
            const kickedCount = players.size;
            players.clear();

            broadcastToAll({
                type: 'LOBBY_RESET',
                playerCount: players.size,
                maxPlayers: MAX_PLAYERS,
                players: getPlayerListSummary()
            });
            console.log(`[MATCH] Máy chủ đã xóa ${kickedCount} người chơi khỏi sảnh và đưa phòng về trạng thái Sảnh Chờ ban đầu.`);
            return;
        }

        // 8. CLIENT HỒI SINH
        if (msg.type === 'PLAYER_REVIVE') {
            const player = players.get(msg.playerId || currentSocketPlayerId);
            if (player) {
                player.hp = 50;
                player.eliminated = false;
                broadcastToAll({
                    type: 'LEADERBOARD_UPDATE',
                    leaderboard: getSortedLeaderboard()
                });
            }
            return;
        }
    });

    ws.on('close', () => {
        if (ws === hostSocket) {
            hostSocket = null;
            console.log('[HOST] Máy chủ host WebSocket đóng.');
            return;
        }

        if (currentSocketPlayerId && players.has(currentSocketPlayerId)) {
            const p = players.get(currentSocketPlayerId);
            p.connected = false;
            console.log(`[DISCONNECT] "${p.name}" mất kết nối.`);

            if (gameState === 'LOBBY') {
                players.delete(currentSocketPlayerId);
            }

            broadcastToAll({
                type: 'LOBBY_UPDATE',
                playerCount: players.size,
                maxPlayers: MAX_PLAYERS,
                players: getPlayerListSummary()
            });

            if (gameState === 'QUESTION_ACTIVE') {
                checkEarlyReveal();
            }
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('\n===============================================================');
    console.log('🔥 VÒNG BO LIÊM CHÍNH — SERVER MÔ HÌNH ĐỒNG BỘ ROUND & TỐC ĐỘ 🔥');
    console.log('===============================================================');
    console.log(`👑 Giao diện Quản Trị Máy Chủ (HOST):  http://localhost:${PORT}/host`);
    console.log(`📱 Người Chơi Tham Gia (CLIENT):       ${clientUrl}`);
    console.log(`⚡ Thang điểm: 100đ cơ bản + Tối đa 50đ Tốc độ (Speed Bonus)`);
    console.log(`🎯 Độ dài 4 phương án cân bằng tuyệt đối - Từ vựng CEFR B1`);
    console.log('===============================================================\n');
});
