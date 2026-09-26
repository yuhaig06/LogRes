const API_BASE_URL = "http://localhost:3000";

let mode = "adult";

const registerForm = document.getElementById("registerForm");
const submitRegisterBtn = document.getElementById("submitRegisterBtn");
const backToLoginBtn = document.getElementById("backToLoginBtn");

const modeLabel = document.getElementById("modeLabel");
const childBtn = document.getElementById("childBtn");
const adultBtn = document.getElementById("adultBtn");
const elderBtn = document.getElementById("elderBtn");

const usernameLabel = document.getElementById("usernameLabel");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const helpText = document.getElementById("helpText");

const modes = {
    child: {
        label: "Chế độ trẻ em",
        usernameLabel: "Email / SĐT phụ huynh",
        usernamePlaceholder: "Bé không tự đăng ký — dùng tài khoản cha mẹ"
    },
    adult: {
        label: "Chế độ người lớn",
        usernameLabel: "Email / Số điện thoại",
        usernamePlaceholder: "Nhập email hoặc số điện thoại"
    },
    elder: {
        label: "Chế độ người lớn tuổi",
        usernameLabel: "Số điện thoại",
        usernamePlaceholder: "Nhập số điện thoại"
    }
};

function setMode(newMode) {
    if (!modes[newMode]) {
        return;
    }

    mode = newMode;
    document.body.classList.remove("child", "adult", "elder");
    document.body.classList.add(mode);
    renderMode();
}

function renderMode() {
    const currentMode = modes[mode];
    modeLabel.textContent = currentMode.label;
    usernameLabel.textContent = currentMode.usernameLabel;
    usernameInput.placeholder = currentMode.usernamePlaceholder;
    helpText.classList.remove("error", "success");
    helpText.textContent = "";
    submitRegisterBtn.disabled = false;

    if (mode === "child") {
        showError("Bé dưới 18 tuổi không tự tạo tài khoản. Phụ huynh hãy chọn Người lớn để đăng ký, rồi thêm hồ sơ bé.");
        submitRegisterBtn.disabled = true;
    }
}

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

function validateForm(username, password, confirmPassword) {
    if (!username || !password || !confirmPassword) {
        showError("Vui lòng nhập đầy đủ thông tin.");
        return false;
    }

    if (mode === "adult") {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
        const isPhone = /^\d{10,11}$/.test(username);

        if (!isEmail && !isPhone) {
            showError("Vui lòng nhập email hoặc số điện thoại hợp lệ.");
            return false;
        }
    }

    if (mode === "child") {
        showError("Bé dưới 18 tuổi không tự tạo tài khoản. Hãy đăng ký bằng tài khoản phụ huynh.");
        return false;
    }

    if (mode === "elder" && !/^\d{10,11}$/.test(username)) {
        showError("Vui lòng nhập số điện thoại hợp lệ.");
        return false;
    }

    if (password.length < 6) {
        showError("Mật khẩu phải có ít nhất 6 ký tự.");
        return false;
    }

    if (password !== confirmPassword) {
        showError("Mật khẩu xác nhận không khớp.");
        return false;
    }

    return true;
}

childBtn.addEventListener("click", () => setMode("child"));
adultBtn.addEventListener("click", () => setMode("adult"));
elderBtn.addEventListener("click", () => setMode("elder"));

backToLoginBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!validateForm(username, password, confirmPassword)) {
        return;
    }

    submitRegisterBtn.disabled = true;
    submitRegisterBtn.textContent = "Đang tạo...";

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password,
                mode
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showError(data.message || "Không thể tạo tài khoản.");
            return;
        }

        showSuccess(data.message || "Tạo tài khoản thành công.");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1200);
    } catch (error) {
        console.error("Register request failed:", error);
        showError("Không thể kết nối tới máy chủ.");
    } finally {
        submitRegisterBtn.disabled = false;
        submitRegisterBtn.textContent = "Tạo tài khoản";
    }
});

setMode("adult");
