// =========================================================
// CONFIG
// =========================================================

const API_BASE_URL = "http://localhost:3000";


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

    getUser() {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
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
// DOM
// =========================================================

const dashboardTitle = document.getElementById("dashboardTitle");
const adminBtn = document.getElementById("adminBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfoUsername = document.getElementById("userInfoUsername");
const userInfoMode = document.getElementById("userInfoMode");
const dashboardMessage = document.getElementById("dashboardMessage");

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
        title: "Chào bé!",
        modeLabel: "Trẻ em",
        message: "Bé đang dùng tài khoản phụ huynh, dưới sự giám sát của cha mẹ.",
        chatMessage: "Bé cần giúp đỡ gì không?"
    },
    adult: {
        title: "Xin chào!",
        modeLabel: "Người lớn",
        message: "Bạn đã đăng nhập thành công. Hệ thống sẵn sàng phục vụ.",
        chatMessage: "Bạn cần hỗ trợ gì không?"
    },
    elder: {
        title: "Chào ông/bà!",
        modeLabel: "Người lớn tuổi",
        message: "Ông/bà đã đăng nhập thành công. Mọi thứ đã sẵn sàng.",
        chatMessage: "Ông/bà cần giúp đỡ gì không?"
    }
};


// =========================================================
// RENDER DASHBOARD
// =========================================================

function renderDashboard() {
    const user = storage.getUser();

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const modeData = modes[user.mode] || modes.adult;

    dashboardTitle.textContent = modeData.title;
    userInfoUsername.textContent = user.supervised
        ? `${user.username} (phụ huynh)`
        : user.username;
    userInfoMode.textContent = modeData.modeLabel;
    dashboardMessage.textContent = modeData.message;
    chatMessage.textContent = modeData.chatMessage;

    const supervisionBanner = document.getElementById("supervisionBanner");
    const familyLink = document.getElementById("familyLink");

    if (user.mode === "child" || user.supervised) {
        supervisionBanner.hidden = false;
        familyLink.hidden = true;
        adminBtn.style.display = "none";
    } else {
        supervisionBanner.hidden = true;
        familyLink.hidden = false;
        if (user.is_admin) {
            adminBtn.style.display = "block";
        } else {
            adminBtn.style.display = "none";
        }
        loadChildren();
    }

    document.body.classList.remove("child", "adult", "elder");
    document.body.classList.add(user.mode);
}


// =========================================================
// LOGOUT
// =========================================================

async function logout() {
    const token = storage.getToken();

    if (!token) {
        storage.clearSession();
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Logout failed:", data.message);
        }
    } catch (error) {
        console.error("Logout request failed:", error);
    } finally {
        storage.clearSession();
        window.location.href = "index.html";
    }
}

logoutBtn.addEventListener("click", logout);

adminBtn.addEventListener("click", () => {
    window.location.href = "admin.html";
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

chatToggle.addEventListener("click", toggleChat);
chatClose.addEventListener("click", closeChat);

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
// CHAT API
// =========================================================

async function sendChatMessage() {
    const message = chatInput.value.trim();

    if (!message) {
        return;
    }

    const token = storage.getToken();

    if (!token) {
        chatMessage.textContent = "Vui lòng đăng nhập trước.";
        return;
    }

    chatSend.disabled = true;
    chatInput.disabled = true;
    chatMessage.textContent = "Đang suy nghĩ...";

    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                message
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                storage.clearSession();
                chatMessage.textContent = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
                return;
            }

            chatMessage.textContent = data.message || "Không thể xử lý yêu cầu.";
            return;
        }

        if (!data.success) {
            chatMessage.textContent = data.message || "Không thể xử lý yêu cầu.";
            return;
        }

        chatMessage.textContent = data.reply;
        chatInput.value = "";

    } catch (error) {
        console.error("Chat request failed:", error);
        chatMessage.textContent = "Không thể kết nối tới trợ lý AI.";
    } finally {
        chatSend.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
    }
}

chatSend.addEventListener("click", sendChatMessage);

chatInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();
    sendChatMessage();
});


// =========================================================
// INITIALIZE
// =========================================================

function initialize() {
    renderDashboard();
}

initialize();
