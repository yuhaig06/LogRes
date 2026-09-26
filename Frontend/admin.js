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

    getUser() {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },

    clearSession() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
    }
};


// =========================================================
// DOM
// =========================================================

const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const backToDashboardBtn = document.getElementById("backToDashboardBtn");

const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const usersTable = document.getElementById("usersTable");
const usersTableBody = document.getElementById("usersTableBody");


// =========================================================
// CHECK ADMIN
// =========================================================

function checkAdmin() {
    const user = storage.getUser();

    if (!user || !user.is_admin) {
        alert("Bạn không có quyền truy cập trang này.");
        window.location.href = "dashboard.html";
        return false;
    }

    return true;
}


// =========================================================
// FETCH USERS
// =========================================================

async function fetchUsers() {
    const token = storage.getToken();

    if (!token) {
        storage.clearSession();
        window.location.href = "index.html";
        return;
    }

    loadingMessage.style.display = "block";
    errorMessage.style.display = "none";
    usersTable.style.display = "none";

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                storage.clearSession();
                errorMessage.textContent = "Bạn không có quyền truy cập hoặc phiên đã hết hạn.";
                window.location.href = "index.html";
                return;
            }

            errorMessage.textContent = data.message || "Không thể tải danh sách người dùng.";
            errorMessage.style.display = "block";
            return;
        }

        renderUsersTable(data.users);

    } catch (error) {
        console.error("Fetch users failed:", error);
        errorMessage.textContent = "Không thể kết nối tới máy chủ.";
        errorMessage.style.display = "block";
    } finally {
        loadingMessage.style.display = "none";
    }
}


// =========================================================
// RENDER USERS TABLE
// =========================================================

function renderUsersTable(users) {
    usersTableBody.innerHTML = "";

    if (users.length === 0) {
        usersTableBody.innerHTML = "<tr><td colspan='7' style='text-align: center;'>Không có người dùng nào.</td></tr>";
        usersTable.style.display = "block";
        return;
    }

    users.forEach(user => {
        const row = document.createElement("tr");

        const modeLabels = {
            child: "Trẻ em",
            adult: "Người lớn",
            elder: "Người lớn tuổi"
        };

        const statusClass = user.is_locked ? "status-locked" : "status-active";
        const statusText = user.is_locked ? "Đã khóa" : "Hoạt động";

        const adminBadge = user.is_admin ? '<span class="admin-badge">Admin</span>' : "";

        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${modeLabels[user.mode] || user.mode}</td>
            <td>${user.failed_attempts}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>${adminBadge}</td>
            <td>
                ${user.is_locked ? `<button class="action-btn unlock-btn" data-user-id="${user.id}">Mở khóa</button>` : ""}
                ${user.failed_attempts > 0 ? `<button class="action-btn reset-btn" data-user-id="${user.id}">Reset</button>` : ""}
            </td>
        `;

        usersTableBody.appendChild(row);
    });

    usersTable.style.display = "block";

    attachActionListeners();
}


// =========================================================
// ACTION LISTENERS
// =========================================================

function attachActionListeners() {
    const unlockBtns = document.querySelectorAll(".unlock-btn");
    const resetBtns = document.querySelectorAll(".reset-btn");

    unlockBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const userId = btn.getAttribute("data-user-id");
            unlockUser(userId);
        });
    });

    resetBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const userId = btn.getAttribute("data-user-id");
            resetFailedAttempts(userId);
        });
    });
}


// =========================================================
// UNLOCK USER
// =========================================================

async function unlockUser(userId) {
    const token = storage.getToken();

    if (!token) {
        storage.clearSession();
        window.location.href = "index.html";
        return;
    }

    if (!confirm("Bạn có chắc muốn mở khóa tài khoản này?")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/unlock`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Không thể mở khóa tài khoản.");
            return;
        }

        alert("Đã mở khóa tài khoản thành công!");
        fetchUsers();

    } catch (error) {
        console.error("Unlock user failed:", error);
        alert("Không thể kết nối tới máy chủ.");
    }
}


// =========================================================
// RESET FAILED ATTEMPTS
// =========================================================

async function resetFailedAttempts(userId) {
    const token = storage.getToken();

    if (!token) {
        storage.clearSession();
        window.location.href = "index.html";
        return;
    }

    if (!confirm("Bạn có chắc muốn reset số lần nhập sai của tài khoản này?")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-attempts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Không thể reset số lần nhập sai.");
            return;
        }

        alert("Đã reset số lần nhập sai thành công!");
        fetchUsers();

    } catch (error) {
        console.error("Reset failed attempts failed:", error);
        alert("Không thể kết nối tới máy chủ.");
    }
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


// =========================================================
// REFRESH
// =========================================================

refreshBtn.addEventListener("click", fetchUsers);


// =========================================================
// BACK TO DASHBOARD
// =========================================================

backToDashboardBtn.addEventListener("click", () => {
    window.location.href = "dashboard.html";
});


// =========================================================
// INITIALIZE
// =========================================================

function initialize() {
    if (!checkAdmin()) {
        return;
    }

    fetchUsers();
}

initialize();
