import { auth } from "https://www.kyzzneko.zone.id/assets/db/firebase.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

function protectRoute() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.replace(window.location.origin + "/Login");
        }
    });
}

protectRoute();
