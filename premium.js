/*==========================================================
                SemesterX Premium Dashboard
    (Reuses isLoggedIn, getCurrentUser, logout, showToast,
     initTheme and isPremiumUser from script.js)
==========================================================*/

const DEV_MODE = false;
document.addEventListener("DOMContentLoaded", () => {

    initPremiumDashboard();

});


function initPremiumDashboard() {

    guardPremiumAccess();

    initPremiumTheme();

    populatePremiumWelcome();

    initPremiumMenu();

    initPremiumCards();

    initPremiumLogout();

}


/*==========================================================
                ACCESS GUARD
==========================================================*/

function guardPremiumAccess() {

    if (DEV_MODE) return;
    if (typeof isPremiumUser !== "function") {

        return;

    }

    if (!isPremiumUser()) {

        window.location.href = "index.html";

    }

}


/*==========================================================
                THEME (match existing site)
==========================================================*/

function initPremiumTheme() {

    if (typeof initTheme === "function") {

        initTheme();

    }

}


/*==========================================================
                WELCOME HEADER
==========================================================*/

function populatePremiumWelcome() {

    const nameLabel = document.getElementById("premium-user-name");

    if (!nameLabel) return;

    if (typeof getCurrentUser === "function") {

        const user = getCurrentUser();

        if (user && user.name) {

            nameLabel.textContent = user.name;

        }

    }

}


/*==========================================================
                SIDEBAR MENU
==========================================================*/

function initPremiumMenu() {

    document

        .querySelectorAll(".premium-menu-item")

        .forEach(item => {

            item.addEventListener("click", () => {

                document

                    .querySelectorAll(".premium-menu-item")

                    .forEach(el => el.classList.remove("active"));

                item.classList.add("active");

                handlePremiumSection(item.dataset.section);

            });

        });

}


/*==========================================================
                DASHBOARD CARDS
==========================================================*/

function initPremiumCards() {

    document

        .querySelectorAll(".premium-main .dash-card")

        .forEach(card => {

            card.addEventListener("click", () => {

                handlePremiumSection(card.dataset.section);

            });

        });

}


/*==========================================================
                SECTION HANDLER
==========================================================*/

function handlePremiumSection(section) {

    if (section === "dashboard") {

        return;

    }

    if (section === "profile") {

        showPremiumToast("Profile settings coming soon.");

        return;

    }

    const labels = {

        roadmap: "Roadmap",

        video: "Video Bootcamp",

        notes: "Short Notes",

        pyq: "PYQ Solutions"

    };

    showPremiumToast(

        (labels[section] || "This section") + " is coming soon."

    );

}


/*==========================================================
                TOAST HELPER
==========================================================*/

function showPremiumToast(message) {

    if (typeof showToast === "function") {

        showToast(message, "info");

        return;

    }

    console.log(message);

}


/*==========================================================
                LOGOUT
==========================================================*/

function initPremiumLogout() {

    const logoutBtn = document.getElementById("premium-logout-btn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {

        if (typeof logout === "function") {

            logout();

        }

        window.location.href = "index.html";

    });

}


/*==========================================================
                    END OF FILE
==========================================================*/
