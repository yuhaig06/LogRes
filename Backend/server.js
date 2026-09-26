
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================================
// CONFIG
// =========================================================

const JWT_SECRET = process.env.JWT_SECRET || "universal-login-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const VALID_MODES = ["child", "adult", "elder"];


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*"
}));
app.use(express.json());

// =========================================================
// DATABASE
// =========================================================

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "universal_login"
});

db.connect((error) => {
    if (error) {
        console.error("MySQL connection failed:", error.message);
        return;
    }

    console.log("MySQL connected");
});

// =========================================================
// HELPERS
// =========================================================

function isValidMode(mode) {
    return VALID_MODES.includes(mode);
}

function isGuardianIdentifier(username) {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
    const isPhone = /^\d{10,11}$/.test(username);
    return isEmail || isPhone;
}

function isValidUsernameForMode(username, mode) {
    if (!username || typeof username !== "string") {
        return false;
    }

    if (mode === "adult" || mode === "child") {
        return isGuardianIdentifier(username);
    }

    if (mode === "elder") {
        return /^\d{10,11}$/.test(username);
    }

    return false;
}

function queryUserByLogin(username, requestedMode, columns, callback) {
    let sql;
    let params;

    if (requestedMode === "child") {
        sql = `
            SELECT ${columns}
            FROM users
            WHERE username = ? AND mode IN ('adult', 'elder')
            ORDER BY CASE WHEN mode = 'adult' THEN 0 ELSE 1 END
            LIMIT 1
        `;
        params = [username];
    } else {
        sql = `
            SELECT ${columns}
            FROM users
            WHERE username = ? AND mode = ?
            LIMIT 1
        `;
        params = [username, requestedMode];
    }

    db.query(sql, params, callback);
}

function createSessionUser(user, sessionMode) {
    const supervised = sessionMode === "child";

    return {
        id: user.id,
        username: user.username,
        mode: sessionMode,
        is_admin: supervised ? false : Boolean(user.is_admin),
        supervised,
        parentId: supervised ? user.id : null
    };
}

function createToken(user, sessionMode = user.mode) {
    return jwt.sign(
        createSessionUser(user, sessionMode),
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN
        }
    );
}

function sendServerError(res) {
    return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ."
    });
}

function fakeAI(message) {
    const text = message.toLowerCase().trim();

    if (!text) {
        const emptyResponses = {
            vi: [
                "Bạn hãy nhập câu hỏi nhé.",
                "Hỏi mình gì đi, mình đang chờ đó!",
                "Bạn muốn biết gì về hệ thống đăng nhập?"
            ],
            en: [
                "Please enter your question.",
                "Go ahead, ask me anything!",
                "What would you like to know about the login system?"
            ]
        };
        const lang = detectLanguage(text);
        const responses = emptyResponses[lang] || emptyResponses.vi;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    const lang = detectLanguage(text);

    const responses = {
        vi: [
            {
                keywords: ["xin chào", "chào", "hi"],
                replies: [
                    "Chào bạn! Mình có thể hỗ trợ gì về hệ thống đăng nhập?",
                    "Hi! Cần giúp đỡ gì với việc đăng nhập không?",
                    "Chào! Mình ở đây để hỗ trợ bạn sử dụng hệ thống.",
                    "Hey! Hỏi mình thoải mái về đăng nhập nhé."
                ]
            },
            {
                keywords: ["đăng nhập", "login"],
                replies: [
                    "Bạn nhập đúng tài khoản, mật khẩu và chọn chế độ người dùng là được.",
                    "Đăng nhập đơn giản lắm: tài khoản + mật khẩu + chọn chế độ.",
                    "Chỉ cần điền thông tin đúng và chọn chế độ phù hợp là xong!",
                    "Bạn thử kiểm tra lại tài khoản, mật khẩu và chế độ xem sao?"
                ]
            },
            {
                keywords: ["mật khẩu", "password"],
                replies: [
                    "Kiểm tra lại mật khẩu xem có đúng không. Quên thì dùng khôi phục nhé.",
                    "Mật khẩu sai rồi đó. Có quên không thì dùng tính năng khôi phục.",
                    "Bạn thử gõ lại mật khẩu xem. Nếu quên thì có thể khôi phục.",
                    "Mật khẩu không đúng? Dùng khôi phục mật khẩu nếu cần."
                ]
            },
            {
                keywords: ["trẻ em", "child"],
                replies: [
                    "Chế độ trẻ em giao diện đơn giản, nội dung dễ hiểu cho bé.",
                    "Child mode có thiết kế thân thiện với trẻ em hơn.",
                    "Chế độ này tối ưu cho bé, dễ dùng và an toàn.",
                    "Trẻ em dùng chế độ này sẽ thấy giao diện dễ hiểu hơn."
                ]
            },
            {
                keywords: ["người lớn", "adult"],
                replies: [
                    "Chế độ người lớn có đầy đủ tính năng của hệ thống.",
                    "Adult mode cung cấp tất cả chức năng bạn cần.",
                    "Dùng chế độ này để truy cập đầy đủ các tính năng.",
                    "Người lớn nên dùng chế độ này để có trải nghiệm đầy đủ."
                ]
            },
            {
                keywords: ["người cao tuổi", "elder", "người già"],
                replies: [
                    "Chế độ người cao tuổi có chữ lớn, màu dễ nhìn, thao tác đơn giản.",
                    "Elder mode tối ưu cho người lớn tuổi với giao diện dễ dùng.",
                    "Chế độ này ưu tiên sự dễ đọc và thao tác đơn giản.",
                    "Người lớn tuổi dùng chế độ này sẽ thoải mái hơn."
                ]
            },
            {
                keywords: ["cảm ơn", "thanks", "thank"],
                replies: [
                    "Không có gì! Rất vui được hỗ trợ bạn.",
                    "Rất hạnh phúc khi giúp được bạn!",
                    "Không có chi đâu, cần gì cứ hỏi nhé.",
                    "Bạn vui thì mình cũng vui rồi đó!"
                ]
            },
            {
                keywords: ["tài khoản", "account"],
                replies: [
                    "Bạn cần tạo tài khoản mới hay khôi phục tài khoản cũ?",
                    "Về tài khoản thì bạn cần hỗ trợ gì cụ thể?",
                    "Tài khoản của bạn có vấn đề gì không?",
                    "Hãy cho mình biết bạn cần giúp gì với tài khoản."
                ]
            },
            {
                keywords: ["lỗi", "error", "không được", "fail"],
                replies: [
                    "Bạn gặp lỗi gì cụ thể không? Mình xem thử.",
                    "Lỗi gì thế? Mô tả chi tiết giúp mình nhé.",
                    "Có screenshot hoặc mô tả lỗi không để mình hỗ trợ?",
                    "Đừng lo, mình cùng bạn tìm cách sửa lỗi."
                ]
            },
            {
                keywords: ["khóa", "lock", "bị khóa"],
                replies: [
                    "Tài khoản bị khóa thì liên hệ admin để mở nhé.",
                    "Bị khóa à? Bạn cần liên hệ hỗ trợ để mở tài khoản.",
                    "Tài khoản khóa do nhập sai nhiều lần. Liên hệ admin nhé.",
                    "Khóa tài khoản thì phải nhờ admin mở mới được."
                ]
            }
        ],
        en: [
            {
                keywords: ["hello", "hi", "hey"],
                replies: [
                    "Hello! How can I help you with the login system?",
                    "Hi there! Need help with logging in?",
                    "Hey! I'm here to help you use the system.",
                    "Hi! Feel free to ask me about login."
                ]
            },
            {
                keywords: ["login", "sign in"],
                replies: [
                    "Just enter your account, password, and select the user mode.",
                    "Login is simple: account + password + select mode.",
                    "Just fill in the correct info and choose the right mode!",
                    "Try checking your account, password, and mode?"
                ]
            },
            {
                keywords: ["password"],
                replies: [
                    "Check if your password is correct. Use recovery if you forgot.",
                    "Password is wrong. Use recovery if you forgot it.",
                    "Try typing your password again. Use recovery if needed.",
                    "Password incorrect? Use password recovery if needed."
                ]
            },
            {
                keywords: ["child", "kid"],
                replies: [
                    "Child mode has a simple interface and easy-to-understand content.",
                    "Child mode is designed to be more kid-friendly.",
                    "This mode is optimized for kids, easy to use and safe.",
                    "Children will find this mode easier to understand."
                ]
            },
            {
                keywords: ["adult"],
                replies: [
                    "Adult mode has full system features.",
                    "Adult mode provides all the functions you need.",
                    "Use this mode to access all features.",
                    "Adults should use this mode for the full experience."
                ]
            },
            {
                keywords: ["elder", "senior", "old"],
                replies: [
                    "Elder mode has large text, easy-to-see colors, and simple operations.",
                    "Elder mode is optimized for seniors with an easy-to-use interface.",
                    "This mode prioritizes readability and simple operations.",
                    "Seniors will find this mode more comfortable."
                ]
            },
            {
                keywords: ["thank", "thanks"],
                replies: [
                    "You're welcome! Happy to help you.",
                    "Glad I could help!",
                    "No problem, just ask if you need anything.",
                    "Your happy makes me happy too!"
                ]
            },
            {
                keywords: ["account"],
                replies: [
                    "Do you need to create a new account or recover an old one?",
                    "What specific help do you need with your account?",
                    "Is there any problem with your account?",
                    "Let me know what you need help with regarding your account."
                ]
            },
            {
                keywords: ["error", "fail", "not working"],
                replies: [
                    "What specific error are you getting? Let me check.",
                    "What error? Describe it in detail so I can help.",
                    "Any screenshot or error description so I can assist?",
                    "Don't worry, I'll help you fix the error."
                ]
            },
            {
                keywords: ["lock", "locked", "banned"],
                replies: [
                    "If your account is locked, contact admin to unlock it.",
                    "Locked? You need to contact support to unlock your account.",
                    "Account locked due to too many failed attempts. Contact admin.",
                    "Locked account requires admin to unlock."
                ]
            }
        ]
    };

    const langResponses = responses[lang] || responses.vi;

    for (const { keywords, replies } of langResponses) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return replies[Math.floor(Math.random() * replies.length)];
        }
    }

    const defaultResponses = {
        vi: [
            "Mình chưa hiểu rõ lắm. Bạn nói cụ thể hơn về đăng nhập được không?",
            "Câu hỏi này hơi khó với mình. Bạn có thể hỏi về đăng nhập hoặc chế độ người dùng không?",
            "Hmm, mình chưa bắt kịp. Bạn thử hỏi về hệ thống đăng nhập xem?",
            "Mình chuyên hỗ trợ về đăng nhập và chế độ người dùng, bạn hỏi về cái đó nhé."
        ],
        en: [
            "I don't quite understand. Can you be more specific about login?",
            "This question is a bit hard for me. Can you ask about login or user modes?",
            "Hmm, I didn't catch that. Try asking about the login system?",
            "I specialize in login and user modes, so ask about that."
        ]
    };

    const defaults = defaultResponses[lang] || defaultResponses.vi;
    return defaults[Math.floor(Math.random() * defaults.length)];
}

function detectLanguage(text) {
    const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    return vietnameseChars.test(text) ? 'vi' : 'en';
}

// =========================================================
// AUTH MIDDLEWARE
// =========================================================

function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập."
        });
    }

    const parts = authorization.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ."
        });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Phiên đăng nhập đã hết hạn."
            });
        }

        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ."
        });
    }
}

// =========================================================
// ADMIN MIDDLEWARE
// =========================================================

function adminMiddleware(req, res, next) {
    if (!req.user || !req.user.is_admin || req.user.supervised || req.user.mode === "child") {
        return res.status(403).json({
            success: false,
            message: "Bạn không có quyền truy cập."
        });
    }

    next();
}

function parentMiddleware(req, res, next) {
    if (!req.user || req.user.mode === "child" || req.user.supervised) {
        return res.status(403).json({
            success: false,
            message: "Chỉ phụ huynh mới quản lý hồ sơ trẻ em."
        });
    }

    next();
}

// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Server is running"
    });
});

// =========================================================
// REGISTER
// =========================================================

app.post("/register", async (req, res) => {
    const { username, password, mode } = req.body;

    if (!username || !password || !isValidMode(mode)) {
        return res.status(400).json({
            success: false,
            message: "Dữ liệu đăng ký không hợp lệ."
        });
    }

    if (mode === "child") {
        return res.status(403).json({
            success: false,
            message: "Bé dưới 18 tuổi không tự tạo tài khoản. Phụ huynh hãy đăng ký chế độ Người lớn, rồi thêm hồ sơ trẻ em."
        });
    }

    if (!isValidUsernameForMode(username, mode)) {
        return res.status(400).json({
            success: false,
            message: "Tên đăng nhập không đúng định dạng với chế độ đã chọn."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Mật khẩu phải có ít nhất 6 ký tự."
        });
    }

    const checkSql = `
        SELECT id
        FROM users
        WHERE username = ? AND mode = ?
        LIMIT 1
    `;

    db.query(checkSql, [username, mode], async (error, results) => {
        if (error) {
            console.error("Database query failed:", error);
            return sendServerError(res);
        }

        if (results.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Tài khoản đã tồn tại với chế độ này."
            });
        }

        try {
            const passwordHash = await bcrypt.hash(password, 10);

            const insertSql = `
                INSERT INTO users (
                    username,
                    password_hash,
                    mode,
                    failed_attempts,
                    is_locked,
                    is_admin,
                    role
                )
                VALUES (?, ?, ?, 0, 0, 0, 'user')
            `;

            db.query(insertSql, [username, passwordHash, mode], (insertError) => {
                if (insertError) {
                    if (insertError.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            success: false,
                            message: "Tài khoản đã tồn tại với chế độ này."
                        });
                    }

                    console.error("Insert user failed:", insertError);
                    return sendServerError(res);
                }

                return res.status(201).json({
                    success: true,
                    message: "Tạo tài khoản thành công. Hãy đăng nhập."
                });
            });
        } catch (hashError) {
            console.error("Password hash failed:", hashError);
            return sendServerError(res);
        }
    });
});

// =========================================================
// LOGIN
// =========================================================

app.post("/login", (req, res) => {
    const { username, password, mode } = req.body;

    if (!username || !password || !isValidMode(mode)) {
        return res.status(400).json({
            success: false,
            message: "Dữ liệu đăng nhập không hợp lệ."
        });
    }

    const loginColumns = `
            id,
            username,
            password_hash,
            mode,
            failed_attempts,
            is_locked,
            is_admin
    `;

    queryUserByLogin(username, mode, loginColumns, async (error, results) => {
        if (error) {
            console.error("Database query failed:", error);
            return sendServerError(res);
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: mode === "child"
                    ? "Không tìm thấy tài khoản phụ huynh. Bé dưới 18 tuổi phải đăng nhập bằng tài khoản cha mẹ."
                    : "Thông tin đăng nhập không chính xác."
            });
        }

        const user = results[0];

        if (user.is_locked) {
            return res.status(403).json({
                success: false,
                message: "Tài khoản đã bị khóa. Vui lòng liên hệ admin để mở khóa."
            });
        }

        try {
            const passwordMatch = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!passwordMatch) {
                const newFailedAttempts = user.failed_attempts + 1;
                const shouldLock = newFailedAttempts >= 5;

                const updateSql = `
                    UPDATE users
                    SET failed_attempts = ?, is_locked = ?
                    WHERE id = ?
                `;

                db.query(updateSql, [newFailedAttempts, shouldLock, user.id], (updateError) => {
                    if (updateError) {
                        console.error("Update failed_attempts failed:", updateError);
                    }
                });

                if (shouldLock) {
                    return res.status(403).json({
                        success: false,
                        message: "Tài khoản đã bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng liên hệ admin."
                    });
                }

                const remainingAttempts = 5 - newFailedAttempts;
                return res.status(401).json({
                    success: false,
                    message: `Mật khẩu không đúng. Bạn còn ${remainingAttempts} lần thử.`
                });
            }

            const resetSql = `
                UPDATE users
                SET failed_attempts = 0
                WHERE id = ?
            `;

            db.query(resetSql, [user.id], (resetError) => {
                if (resetError) {
                    console.error("Reset failed_attempts failed:", resetError);
                }
            });

            const token = createToken(user, mode);
            const sessionUser = createSessionUser(user, mode);

            return res.status(200).json({
                success: true,
                message: mode === "child"
                    ? "Đăng nhập thành công. Bé đang dùng tài khoản dưới sự giám sát của phụ huynh."
                    : "Đăng nhập thành công.",
                token,
                user: sessionUser
            });

        } catch (error) {
            console.error("Password comparison failed:", error);
            return sendServerError(res);
        }
    });
});

// =========================================================
// CURRENT USER
// =========================================================

app.get("/me", authMiddleware, (req, res) => {
    return res.status(200).json({
        success: true,
        user: {
            id: req.user.id,
            username: req.user.username,
            mode: req.user.mode,
            is_admin: Boolean(req.user.is_admin),
            supervised: Boolean(req.user.supervised),
            parentId: req.user.parentId || null
        }
    });
});

// =========================================================
// LOGOUT
// =========================================================

app.post("/logout", authMiddleware, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Đăng xuất thành công."
    });
});


// =========================================================
// CHAT
// =========================================================

app.post("/chat", authMiddleware, (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
        return res.status(400).json({
            success: false,
            message: "Nội dung tin nhắn không hợp lệ."
        });
    }

    const reply = fakeAI(message);

    res.json({
        success: true,
        reply
    });
});

// =========================================================
// FORGOT PASSWORD - SEND OTP
// =========================================================

app.post("/forgot-password", (req, res) => {
    const { username, mode } = req.body;

    if (!username || !isValidMode(mode)) {
        return res.status(400).json({
            success: false,
            message: "Dữ liệu không hợp lệ."
        });
    }

    queryUserByLogin(username, mode, "id, username", (error, results) => {
        if (error) {
            console.error("Database query failed:", error);
            return sendServerError(res);
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản."
            });
        }

        const user = results[0];

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        const updateSql = `
            UPDATE users
            SET otp = ?, otp_expiry = ?
            WHERE id = ?
        `;

        db.query(updateSql, [otp, otpExpiry, user.id], (updateError) => {
            if (updateError) {
                console.error("Update OTP failed:", updateError);
                return sendServerError(res);
            }

            console.log(`OTP for ${username}: ${otp}`);

            return res.status(200).json({
                success: true,
                message: "OTP đã được gửi (giả lập)."
            });
        });
    });
});

// =========================================================
// VERIFY OTP
// =========================================================

app.post("/verify-otp", (req, res) => {
    const { username, mode, otp } = req.body;

    if (!username || !isValidMode(mode) || !otp) {
        return res.status(400).json({
            success: false,
            message: "Dữ liệu không hợp lệ."
        });
    }

    queryUserByLogin(username, mode, "id, otp, otp_expiry", (error, results) => {
        if (error) {
            console.error("Database query failed:", error);
            return sendServerError(res);
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản."
            });
        }

        const user = results[0];

        if (!user.otp || !user.otp_expiry) {
            return res.status(400).json({
                success: false,
                message: "OTP không tồn tại. Vui lòng yêu cầu OTP mới."
            });
        }

        const now = new Date();
        if (now > new Date(user.otp_expiry)) {
            return res.status(400).json({
                success: false,
                message: "OTP đã hết hạn. Vui lòng yêu cầu OTP mới."
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "OTP không đúng."
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP hợp lệ."
        });
    });
});

// =========================================================
// RESET PASSWORD
// =========================================================

app.post("/reset-password", async (req, res) => {
    const { username, mode, otp, newPassword } = req.body;

    if (!username || !isValidMode(mode) || !otp || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Dữ liệu không hợp lệ."
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Mật khẩu phải có ít nhất 6 ký tự."
        });
    }

    queryUserByLogin(username, mode, "id, otp, otp_expiry", async (error, results) => {
        if (error) {
            console.error("Database query failed:", error);
            return sendServerError(res);
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản."
            });
        }

        const user = results[0];

        if (!user.otp || !user.otp_expiry) {
            return res.status(400).json({
                success: false,
                message: "OTP không tồn tại. Vui lòng yêu cầu OTP mới."
            });
        }

        const now = new Date();
        if (now > new Date(user.otp_expiry)) {
            return res.status(400).json({
                success: false,
                message: "OTP đã hết hạn. Vui lòng yêu cầu OTP mới."
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "OTP không đúng."
            });
        }

        try {
            const passwordHash = await bcrypt.hash(newPassword, 10);

            const updateSql = `
                UPDATE users
                SET password_hash = ?, otp = NULL, otp_expiry = NULL, failed_attempts = 0, is_locked = FALSE
                WHERE id = ?
            `;

            db.query(updateSql, [passwordHash, user.id], (updateError) => {
                if (updateError) {
                    console.error("Update password failed:", updateError);
                    return sendServerError(res);
                }

                return res.status(200).json({
                    success: true,
                    message: "Đặt lại mật khẩu thành công."
                });
            });

        } catch (hashError) {
            console.error("Password hash failed:", hashError);
            return sendServerError(res);
        }
    });
});

// =========================================================
// ADMIN - LIST USERS
// =========================================================

app.get("/admin/users", authMiddleware, adminMiddleware, (req, res) => {
    const sql = `
        SELECT
            id,
            username,
            mode,
            failed_attempts,
            is_locked,
            is_admin
        FROM users
        ORDER BY id ASC
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.error("Database query failed:", error);
            return sendServerError(res);
        }

        return res.status(200).json({
            success: true,
            users: results
        });
    });
});

// =========================================================
// ADMIN - UNLOCK USER
// =========================================================

app.post("/admin/users/:userId/unlock", authMiddleware, adminMiddleware, (req, res) => {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({
            success: false,
            message: "ID người dùng không hợp lệ."
        });
    }

    const sql = `
        UPDATE users
        SET is_locked = FALSE, failed_attempts = 0
        WHERE id = ?
    `;

    db.query(sql, [userId], (error, result) => {
        if (error) {
            console.error("Database query failed:", error);
            return sendServerError(res);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Đã mở khóa tài khoản."
        });
    });
});

// =========================================================
// ADMIN - RESET FAILED ATTEMPTS
// =========================================================

app.post("/admin/users/:userId/reset-attempts", authMiddleware, adminMiddleware, (req, res) => {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({
            success: false,
            message: "ID người dùng không hợp lệ."
        });
    }

    const sql = `
        UPDATE users
        SET failed_attempts = 0
        WHERE id = ?
    `;

    db.query(sql, [userId], (error, result) => {
        if (error) {
            console.error("Database query failed:", error);
            return sendServerError(res);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Đã reset số lần nhập sai."
        });
    });
});

// =========================================================
// FAMILY LINK - LIST CHILDREN
// =========================================================

app.get("/family/children", authMiddleware, parentMiddleware, (req, res) => {
    const sql = `
        SELECT id, username
        FROM users
        WHERE parent_id = ? AND mode = 'child'
        ORDER BY id ASC
    `;

    db.query(sql, [req.user.id], (error, results) => {
        if (error) {
            console.error("Database query failed:", error);
            return sendServerError(res);
        }

        return res.status(200).json({
            success: true,
            children: results
        });
    });
});

// =========================================================
// FAMILY LINK - ADD CHILD PROFILE
// =========================================================

app.post("/family/children", authMiddleware, parentMiddleware, async (req, res) => {
    const childName = (req.body.childName || "").trim();

    if (childName.length < 2 || childName.length > 50) {
        return res.status(400).json({
            success: false,
            message: "Tên của bé phải từ 2 đến 50 ký tự."
        });
    }

    try {
        const passwordHash = await bcrypt.hash(`child-${req.user.id}-${Date.now()}`, 10);

        const insertSql = `
            INSERT INTO users (
                username,
                password_hash,
                mode,
                failed_attempts,
                is_locked,
                is_admin,
                role,
                parent_id
            )
            VALUES (?, ?, 'child', 0, 0, 0, 'user', ?)
        `;

        db.query(insertSql, [childName, passwordHash, req.user.id], (insertError, result) => {
            if (insertError) {
                if (insertError.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        success: false,
                        message: "Hồ sơ bé này đã tồn tại. Hãy dùng tên khác."
                    });
                }

                console.error("Insert child failed:", insertError);
                return sendServerError(res);
            }

            return res.status(201).json({
                success: true,
                message: "Đã thêm hồ sơ trẻ em. Bé sẽ đăng nhập bằng tài khoản phụ huynh.",
                child: {
                    id: result.insertId,
                    username: childName
                }
            });
        });
    } catch (hashError) {
        console.error("Password hash failed:", hashError);
        return sendServerError(res);
    }
});

// =========================================================
// 404
// =========================================================

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Không tìm thấy API."
    });
});

// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use((error, req, res, next) => {
    console.error("Unexpected error:", error);

    return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ."
    });
});

// =========================================================
// START SERVER
// =========================================================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});