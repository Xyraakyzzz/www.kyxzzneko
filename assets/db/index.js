import { auth } from "https://www.kyzzneko.zone.id/assets/db/firebase.js";
import { onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

function GetUser() {
    onAuthStateChanged(auth, (user) => {
        const path = window.location.pathname;
        const isLoginPage = path.toLowerCase().includes("login");

        if (!user && !isLoginPage) {
            window.location.replace(window.location.origin + "/Login");
        }

        if (user && isLoginPage) {
            window.location.replace(window.location.origin + "/");
        }
    });
}

function Logout() {
    const btn = document.getElementById("btnLogout");

    if (!btn) return;

    btn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.replace(window.location.origin + "/Login");
        } catch (err) {
            console.error("LOGOUT ERROR:", err);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    GetUser();
    Logout();
});
