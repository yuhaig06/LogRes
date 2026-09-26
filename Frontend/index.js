// =========================================================
// CONFIG
// =========================================================

const API_BASE_URL = "http://localhost:3000";


// =========================================================
// STATE
// =========================================================

let mode = "adult";


// =========================================================
// DOM
// =========================================================

const loginForm = document.querySelector("form");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

const modeLabel = document.getElementById("modeLabel");

const childBtn = document.getElementById("childBtn");
const adultBtn = document.getElementById("adultBtn");
const elderBtn = document.getElementById("elderBtn");

const usernameLabel = document.getElementById("usernameLabel");
const usernameInput = document.getElementById("username");

const passwordLabel = document.getElementById("passwordLabel");
const passwordInput = document.getElementById("password");

const helpText = document.getElementById("helpText");

const chatToggle = document.getElementById("chatToggle");
const chatClose = document.getElementById("chatClose");
const chatBox = document.getElementById("chatBox");
const chatMessage = document.getElementById("chatMessage");

const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");


// =========================================================
// MODE DATA
// =========================================================

const modes = {
    child: {
        label: "Chế độ trẻ em",

        usernameLabel: "Email / SĐT phụ huynh",
        usernamePlaceholder: "Tài khoản cha mẹ hoặc người giám hộ",
        passwordLabel: "Mật khẩu phụ huynh",
        passwordPlaceholder: "Nhập mật khẩu phụ huynh",

        helpText: "",
        chatMessage: "Nếu cần trợ giúp, hãy nhờ phụ huynh hỗ trợ."
    },

    adult: {
        label: "Chế độ người lớn",

        usernameLabel: "Email / Số điện thoại",
        usernamePlaceholder: "Nhập email hoặc số điện thoại",
        passwordLabel: "Mật khẩu",
        passwordPlaceholder: "Nhập mật khẩu",

        helpText: "Đăng nhập bằng thông tin tài khoản của bạn.",
        chatMessage: "Bạn cần hỗ trợ với việc đăng nhập?"
    },

    elder: {
        label: "Chế độ người lớn tuổi",

        usernameLabel: "Số điện thoại",
        usernamePlaceholder: "Nhập số điện thoại",
        passwordLabel: "Mật khẩu",
        passwordPlaceholder: "Nhập mật khẩu",

        helpText: "Bạn có thể nhấn Trợ giúp nếu gặp khó khăn.",
        chatMessage: "Bạn có thể hỏi tôi nếu gặp khó khăn khi đăng nhập."
    }
};


// =========================================================
// STORAGE
// =========================================================

const storage = {
    getToken() {
        return localStorage.getItem("accessToken");
    },

    setToken(token) {
        localStorage.setItem("accessToken", token);
    },

    removeToken() {
        localStorage.removeItem("accessToken");
    },

    setUser(user) {
        localStorage.setItem("user", JSON.stringify(user));
    },

    removeUser() {
        localStorage.removeItem("user");
    },

    clearSession() {
        this.removeToken();
        this.removeUser();
    }
};


// =========================================================
// MODE
// =========================================================

function setMode(newMode) {
    if (!modes[newMode]) {
        return;
    }

    mode = newMode;

    document.body.classList.remove(
        "child",
        "adult",
        "elder"
    );

    document.body.classList.add(mode);

    renderMode();
}


function renderMode() {
    const currentMode = modes[mode];

    modeLabel.textContent = currentMode.label;

    usernameLabel.textContent =
        currentMode.usernameLabel;

    usernameInput.placeholder =
        currentMode.usernamePlaceholder;

    passwordLabel.textContent = currentMode.passwordLabel;
    passwordInput.placeholder = currentMode.passwordPlaceholder;

    helpText.textContent = currentMode.helpText;

    helpText.classList.remove(
        "error",
        "success"
    );

    chatMessage.textContent =
        currentMode.chatMessage;
}


// =========================================================
// MODE EVENTS
// =========================================================

childBtn.addEventListener("click", () => {
    setMode("child");
});

adultBtn.addEventListener("click", () => {
    setMode("adult");
});

elderBtn.addEventListener("click", () => {
    setMode("elder");
});


// =========================================================
// CHATBOT UI
// =========================================================

function openChat() {
    chatBox.classList.add("open");
    chatBox.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
        chatInput.focus();
    });
}


function closeChat() {
    chatBox.classList.remove("open");
    chatBox.setAttribute("aria-hidden", "true");

    // Return focus to the button that opened the chatbot.
    chatToggle.focus();
}


function toggleChat() {
    const isOpen = chatBox.classList.contains("open");

    if (isOpen) {
        closeChat();
        return;
    }

    openChat();
}


// =========================================================
// CHATBOT EVENTS
// =========================================================

chatToggle.addEventListener("click", toggleChat);

chatClose.addEventListener("click", closeChat);


// Close chatbot with Escape
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
        return;
    }

    if (!chatBox.classList.contains("open")) {
        return;
    }

    closeChat();
});


// =========================================================
// MESSAGE
// =========================================================

function showError(message) {
    helpText.textContent = message;

    helpText.classList.remove("success");
    helpText.classList.add("error");
}


function showSuccess(message) {
    helpText.textContent = message;

    helpText.classList.remove("error");
    helpText.classList.add("success");
}


// =========================================================
// VALIDATION
// =========================================================

function validateForm(username, password) {

    if (!username || !password) {
        showError("Vui lòng nhập đầy đủ thông tin.");
        return false;
    }


    // -----------------------------------------------------
    // ADULT
    // -----------------------------------------------------

    if (mode === "adult") {

        const isEmail =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(username);

        const isPhone =
            /^\d{10,11}$/.test(username);

        if (!isEmail && !isPhone) {
            showError(
                "Vui lòng nhập email hoặc số điện thoại hợp lệ."
            );

            return false;
        }
    }


    // -----------------------------------------------------
    // CHILD
    // -----------------------------------------------------

    if (mode === "child") {
        const isEmail =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(username);

        const isPhone =
            /^\d{10,11}$/.test(username);

        if (!isEmail && !isPhone) {
            showError(
                "Bé phải dùng email hoặc số điện thoại của phụ huynh."
            );

            return false;
        }
    }


    // -----------------------------------------------------
    // ELDER
    // -----------------------------------------------------

    if (mode === "elder") {

        if (!/^\d{10,11}$/.test(username)) {
            showError(
                "Vui lòng nhập số điện thoại hợp lệ."
            );

            return false;
        }
    }


    return true;
}


// =========================================================
// LOGIN BUTTON STATE
// =========================================================

function setLoginLoading(isLoading) {

    loginBtn.disabled = isLoading;

    loginBtn.textContent =
        isLoading
            ? "Đang đăng nhập..."
            : "Đăng Nhập";
}


// =========================================================
// LOGIN API
// =========================================================

async function login(username, password) {

    const response = await fetch(
        `${API_BASE_URL}/login`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                password,
                mode
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Đăng nhập thất bại."
        );
    }

    return data;
}


// =========================================================
// LOGIN FORM
// =========================================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value.trim();


    helpText.classList.remove(
        "error",
        "success"
    );


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!validateForm(username, password)) {
        return;
    }


    // -----------------------------------------------------
    // LOGIN
    // -----------------------------------------------------

    setLoginLoading(true);


    try {

        const data =
            await login(username, password);


        // -------------------------------------------------
        // SAVE SESSION
        // -------------------------------------------------

        storage.setToken(data.token);
        storage.setUser(data.user);


        // -------------------------------------------------
        // SAVE TOKEN AND USER
        // -------------------------------------------------

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log(
            "Logged in user:",
            data.user
        );

        console.log("JWT saved");


        // -------------------------------------------------
        // REDIRECT BASED ON ROLE
        // -------------------------------------------------

        if (data.user.is_admin) {
            window.location.href = "admin.html";
        } else {
            window.location.href = "dashboard.html";
        }

    } catch (error) {

        console.error(
            "Login request failed:",
            error
        );

        showError(
            error.message ||
            "Không thể kết nối tới máy chủ."
        );

    } finally {

        setLoginLoading(false);
    }
});


// =========================================================
// GET CURRENT USER
// =========================================================

async function getCurrentUser() {

    const token =
        storage.getToken();


    if (!token) {
        return null;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/me`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        // -------------------------------------------------
        // INVALID / EXPIRED TOKEN
        // -------------------------------------------------

        if (!response.ok) {

            storage.clearSession();

            console.warn(
                "Session expired or invalid."
            );

            return null;
        }


        console.log(
            "Current authenticated user:",
            data.user
        );


        return data.user;

    } catch (error) {

        console.error(
            "Get current user failed:",
            error
        );

        return null;
    }
}


// =========================================================
// CHAT API
// =========================================================

async function sendChatMessage() {

    const message =
        chatInput.value.trim();


    if (!message) {
        return;
    }


    const token =
        storage.getToken();


    if (!token) {
        chatMessage.textContent =
            "Vui lòng đăng nhập trước.";

        return;
    }


    // -----------------------------------------------------
    // LOADING
    // -----------------------------------------------------

    chatSend.disabled = true;
    chatInput.disabled = true;

    chatMessage.textContent =
        "Đang suy nghĩ...";


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        message
                    })
                }
            );


        const data =
            await response.json();


        // -------------------------------------------------
        // API ERROR
        // -------------------------------------------------

        if (!response.ok) {

            if (response.status === 401) {
                storage.clearSession();

                chatMessage.textContent =
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";

                return;
            }

            chatMessage.textContent =
                data.message ||
                "Không thể xử lý yêu cầu.";

            return;
        }


        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        if (!data.success) {
            chatMessage.textContent =
                data.message ||
                "Không thể xử lý yêu cầu.";

            return;
        }

        chatMessage.textContent =
            data.reply;

        chatInput.value = "";

    } catch (error) {

        console.error(
            "Chat request failed:",
            error
        );

        chatMessage.textContent =
            "Không thể kết nối tới trợ lý AI.";

    } finally {

        chatSend.disabled = false;
        chatInput.disabled = false;

        // Keep focus inside chatbot after sending.
        chatInput.focus();
    }
}


// =========================================================
// CHAT EVENTS
// =========================================================

chatSend.addEventListener(
    "click",
    sendChatMessage
);


chatInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        sendChatMessage();
    }
);


// =========================================================
// CHECK SESSION
// =========================================================

async function checkSession() {

    const user =
        await getCurrentUser();


    if (!user) {

        console.log(
            "No active session."
        );

        return;
    }


    console.log(
        "Active session:",
        user
    );
}


// =========================================================
// FORGOT PASSWORD
// =========================================================

registerBtn.addEventListener("click", () => {
    window.location.href = "register.html";
});

forgotPasswordBtn.addEventListener("click", () => {
    window.location.href = "forgot-password.html";
});


// =========================================================
// INITIALIZE
// =========================================================

function initialize() {

    setMode("adult");

    checkSession();
}


initialize();