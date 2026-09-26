// =========================================================
// CONFIG
// =========================================================

const API_BASE_URL = "http://localhost:3000";


// =========================================================
// STATE
// =========================================================

let mode = "adult";
let currentUsername = "";


// =========================================================
// DOM
// =========================================================

const modeLabel = document.getElementById("modeLabel");
const childBtn = document.getElementById("childBtn");
const adultBtn = document.getElementById("adultBtn");
const elderBtn = document.getElementById("elderBtn");

const usernameLabel = document.getElementById("usernameLabel");
const usernameInput = document.getElementById("username");

const helpText = document.getElementById("helpText");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

const sendOtpBtn = document.getElementById("sendOtpBtn");
const backToLoginBtn = document.getElementById("backToLoginBtn");

const otpInput = document.getElementById("otp");
const otpHelpText = document.getElementById("otpHelpText");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const resendOtpBtn = document.getElementById("resendOtpBtn");
const backToStep1Btn = document.getElementById("backToStep1Btn");

const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const passwordHelpText = document.getElementById("passwordHelpText");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const backToLoginBtn2 = document.getElementById("backToLoginBtn2");


// =========================================================
// MODE DATA
// =========================================================

const modes = {
    child: {
        label: "Chế độ trẻ em",
        usernameLabel: "Email / SĐT phụ huynh",
        usernamePlaceholder: "Tài khoản cha mẹ hoặc người giám hộ"
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


// =========================================================
// MODE
// =========================================================

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
}

childBtn.addEventListener("click", () => setMode("child"));
adultBtn.addEventListener("click", () => setMode("adult"));
elderBtn.addEventListener("click", () => setMode("elder"));


// =========================================================
// VALIDATION
// =========================================================

function validateUsername(username) {
    if (!username) {
        helpText.textContent = "Vui lòng nhập tên đăng nhập.";
        helpText.classList.add("error");
        return false;
    }

    if (mode === "adult" || mode === "child") {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
        const isPhone = /^\d{10,11}$/.test(username);

        if (!isEmail && !isPhone) {
            helpText.textContent = mode === "child"
                ? "Bé phải dùng email hoặc số điện thoại của phụ huynh."
                : "Vui lòng nhập email hoặc số điện thoại hợp lệ.";
            helpText.classList.add("error");
            return false;
        }
    }

    if (mode === "elder") {
        if (!/^\d{10,11}$/.test(username)) {
            helpText.textContent = "Vui lòng nhập số điện thoại hợp lệ.";
            helpText.classList.add("error");
            return false;
        }
    }

    helpText.classList.remove("error");
    return true;
}


// =========================================================
// STEP 1: SEND OTP
// =========================================================

async function sendOtp() {
    const username = usernameInput.value.trim();

    if (!validateUsername(username)) {
        return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Đang gửi...";

    try {
        const response = await fetch(`${API_BASE_URL}/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                mode
            })
        });

        const data = await response.json();

        if (!response.ok) {
            helpText.textContent = data.message || "Không thể gửi OTP.";
            helpText.classList.add("error");
            return;
        }

        currentUsername = username;
        helpText.textContent = "OTP đã được gửi (kiểm tra console).";
        helpText.classList.add("success");

        showStep2();

    } catch (error) {
        console.error("Send OTP failed:", error);
        helpText.textContent = "Không thể kết nối tới máy chủ.";
        helpText.classList.add("error");
    } finally {
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = "Gửi OTP";
    }
}

sendOtpBtn.addEventListener("click", sendOtp);


// =========================================================
// STEP 2: VERIFY OTP
// =========================================================

function showStep2() {
    step1.style.display = "none";
    step2.style.display = "block";
    step3.style.display = "none";

    otpInput.value = "";
    otpInput.focus();
}

async function verifyOtp() {
    const otp = otpInput.value.trim();

    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
        otpHelpText.textContent = "Vui lòng nhập 6 số OTP.";
        otpHelpText.classList.add("error");
        return;
    }

    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = "Đang xác nhận...";

    try {
        const response = await fetch(`${API_BASE_URL}/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: currentUsername,
                mode,
                otp
            })
        });

        const data = await response.json();

        if (!response.ok) {
            otpHelpText.textContent = data.message || "OTP không hợp lệ.";
            otpHelpText.classList.add("error");
            return;
        }

        otpHelpText.textContent = "OTP hợp lệ!";
        otpHelpText.classList.remove("error");
        otpHelpText.classList.add("success");

        showStep3();

    } catch (error) {
        console.error("Verify OTP failed:", error);
        otpHelpText.textContent = "Không thể kết nối tới máy chủ.";
        otpHelpText.classList.add("error");
    } finally {
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = "Xác nhận OTP";
    }
}

verifyOtpBtn.addEventListener("click", verifyOtp);

resendOtpBtn.addEventListener("click", () => {
    showStep1();
    sendOtp();
});

backToStep1Btn.addEventListener("click", showStep1);


// =========================================================
// STEP 3: RESET PASSWORD
// =========================================================

function showStep3() {
    step1.style.display = "none";
    step2.style.display = "none";
    step3.style.display = "block";

    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
    newPasswordInput.focus();
}

function showStep1() {
    step1.style.display = "block";
    step2.style.display = "none";
    step3.style.display = "none";

    helpText.textContent = "";
    helpText.classList.remove("error", "success");
}

async function resetPassword() {
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!newPassword || newPassword.length < 6) {
        passwordHelpText.textContent = "Mật khẩu phải có ít nhất 6 ký tự.";
        passwordHelpText.classList.add("error");
        return;
    }

    if (newPassword !== confirmPassword) {
        passwordHelpText.textContent = "Mật khẩu xác nhận không khớp.";
        passwordHelpText.classList.add("error");
        return;
    }

    resetPasswordBtn.disabled = true;
    resetPasswordBtn.textContent = "Đang đặt lại...";

    try {
        const response = await fetch(`${API_BASE_URL}/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: currentUsername,
                mode,
                otp: otpInput.value.trim(),
                newPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            passwordHelpText.textContent = data.message || "Không thể đặt lại mật khẩu.";
            passwordHelpText.classList.add("error");
            return;
        }

        passwordHelpText.textContent = "Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...";
        passwordHelpText.classList.remove("error");
        passwordHelpText.classList.add("success");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);

    } catch (error) {
        console.error("Reset password failed:", error);
        passwordHelpText.textContent = "Không thể kết nối tới máy chủ.";
        passwordHelpText.classList.add("error");
    } finally {
        resetPasswordBtn.disabled = false;
        resetPasswordBtn.textContent = "Đặt lại mật khẩu";
    }
}

resetPasswordBtn.addEventListener("click", resetPassword);

backToLoginBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

backToLoginBtn2.addEventListener("click", () => {
    window.location.href = "index.html";
});


// =========================================================
// INITIALIZE
// =========================================================

function initialize() {
    setMode("adult");
}

initialize();
