import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMHNN-u_K5wgD1ReiavgAhxvFLnRNR-o0",
  authDomain: "semesterx-79f36.firebaseapp.com",
  projectId: "semesterx-79f36",
  storageBucket: "semesterx-79f36.firebasestorage.app",
  messagingSenderId: "848053190954",
  appId: "1:848053190954:web:df719a4ad2546872ca1e53",
  measurementId: "G-B2FBV397DS"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
/*==========================================================
                SemesterX Frontend
        Google OAuth + Spring Boot + JWT
==========================================================*/

/*==========================================================
                    CONFIGURATION
==========================================================*/

const BACKEND_URL = "https://semesterx-production.up.railway.app";

const DEV_MODE = window.DEV_MODE || false;

const CONFIG = {

    departments: [],

    semesters: [],

    subjects: {}

};


/*==========================================================
                    APPLICATION STATE
==========================================================*/

let appState = {

    currentDept: "",

    currentSem: "",

    activeResourceCategory: ""

};

// Stores the navigation history
let navigationHistory = [];

let postAuthRedirectActionCallback = null;


/*==========================================================
                    APPLICATION START
==========================================================*/
const contactForm = document.getElementById("contact-form");

if (contactForm) {

    contactForm.addEventListener("submit", sendContactMessage);

}

document.addEventListener("DOMContentLoaded", () => {

    initializeApplication();

});


async function initializeApplication() {

    initTheme();

    initEventListeners();
    initializeSubjectResourceSearch();

    await waitForGoogleSDK();

    initializeGoogleSignIn();

    checkPersistentAuthStatus();

    startLoaderAnimation();

}


/*==========================================================
                    LOADER
==========================================================*/

function startLoaderAnimation() {

    setTimeout(() => {

        const loader = document.getElementById("loader");

        if (!loader) return;

        loader.style.opacity = "0";

        loader.style.transition = "0.5s";

        setTimeout(() => {

            loader.classList.add("hidden");

            document.querySelectorAll(".shape").forEach(shape => {

                shape.classList.add("show");

            });

        }, 500);

    }, 600);

}
/*==========================================================
                WAIT FOR GOOGLE SDK
==========================================================*/

function waitForGoogleSDK() {

    return new Promise(resolve => {

        if (window.google) {

            resolve();

            return;

        }

        const interval = setInterval(() => {

            if (window.google) {

                clearInterval(interval);

                resolve();

            }

        }, 100);

    });

}


/*==========================================================
                    GOOGLE LOGIN
==========================================================*/

function initializeGoogleSignIn() {

    if (!window.google) {

        console.error("Google Identity Services not loaded");

        return;

    }

    google.accounts.id.initialize({

        client_id:  "611539225489-e1lc5hfodtp06sdro3s45dscnqprdgaj.apps.googleusercontent.com",

        callback: handleCredentialResponse

    });

    const googleButton = document.getElementById("google-signin-button");

    if (googleButton) {

        google.accounts.id.renderButton(

            googleButton,

            {

                theme: "filled_blue",

                size: "large",

                shape: "pill",

                width: 280,

                text: "continue_with"

            }

        );

    }

}


/*==========================================================
                    GOOGLE CALLBACK
==========================================================*/

async function handleCredentialResponse(response) {

    try {

        const result = await fetch(

            BACKEND_URL + "/api/auth/google",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    idToken: response.credential

                })

            }

        );

        if (!result.ok) {

            throw new Error("Authentication Failed");

        }

        const data = await result.json();
        console.log("Backend Response:", data);

        localStorage.setItem("jwt", data.token);

        localStorage.setItem(

            "user",

            JSON.stringify(data)

        );

        showToast(

            "Welcome " + data.name,

            "success"

        );

        closeAuthModal();
        checkPersistentAuthStatus();

        updateDashboardWelcome();

        if (postAuthRedirectActionCallback != null) {

            postAuthRedirectActionCallback();

            postAuthRedirectActionCallback = null;

        }

    }

    catch (error) {

        console.error(error);

        showToast(

            "Google Login Failed",

            "error"

        );

    }

}


/*==========================================================
                    JWT HELPERS
==========================================================*/

function getJwt() {

    if (DEV_MODE) {
        return "DEV_JWT";
    }

    return localStorage.getItem("jwt");
}


function getCurrentUser() {

    if (DEV_MODE) {

        return {
            id: "developer",
            name: "Developer",
            email: "developer@semesterx.dev",
            role: "PREMIUM"
        };

    }

    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    return JSON.parse(user);
}


function isLoggedIn() {

    if (DEV_MODE) {
        return true;
    }

    return getJwt() !== null;
}
/*==========================================================
                DASHBOARD WELCOME
==========================================================*/

function updateDashboardWelcome() {

    const heading =
        document.getElementById(
            "dashboard-welcome"
        );

    if (!heading) return;

    const user = getCurrentUser();

    if (!user || !user.name) {

        heading.textContent =
            "Welcome Back, Explorer!";

        return;

    }

    const firstName =
        user.name.split(" ")[0];

    heading.textContent =
        `Welcome Back, ${firstName}!`;

}


/*==========================================================
                    LOGOUT
==========================================================*/

function logout() {

    localStorage.removeItem("jwt");

    localStorage.removeItem("user");

    if (window.google) {

        google.accounts.id.disableAutoSelect();

    }

    checkPersistentAuthStatus();
    updateDashboardWelcome();
    navigateTo("landing-view");

    showToast(

        "Logged Out Successfully",

        "info"

    );

}
/*==========================================================
                    NAVIGATION
==========================================================*/

function navigateTo(viewId, saveHistory = true) {
    // Save current active page
    const currentView = document.querySelector(".view.active");
    if (currentView && saveHistory) {
      navigationHistory.push(currentView.id);
    }
    document.querySelectorAll(".view").forEach(view => {

        view.classList.remove("active");

    });

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

    const targetView = document.getElementById(viewId);

    if (targetView) {

        targetView.classList.add("active");

    }
    if (!history.state || history.state.view !== viewId) {
      history.pushState(
        { view: viewId },
        "",
        "#" + viewId
      );
    }
    if (viewId === "dashboard-view") {

    document.getElementById("dash-dept-lbl").textContent =
        appState.currentDept;

    document.getElementById("dash-sem-lbl").textContent =
        appState.currentSem;

    updateDashboardWelcome();
    }
    if (viewId === "resource-view") {
      document.getElementById("resource-dept-lbl").textContent =
        appState.currentDept;
      document.getElementById("resource-sem-lbl").textContent =
        appState.currentSem;
    }
    if (viewId === "subject-resource-view") {
      document.getElementById("subject-dept-lbl").textContent =
        appState.currentDept;
      document.getElementById("subject-sem-lbl").textContent =
        appState.currentSem;
    }
    if (viewId === "mentorship-view") {
      renderMentorshipPricingCard();
    }
    const nav = document.getElementById("nav-links");
    if (nav) {
        nav.classList.remove("open");
    }
}
function goToHomeSection(sectionId) {

    // First show the landing page
    navigateTo("landing-view");

    // Wait for the page to become visible
    setTimeout(() => {

        if (sectionId === "landing-view") {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            return;
        }

        const section = document.getElementById(sectionId);

        if (section) {
            section.scrollIntoView({
                behavior: "smooth"
            });
        }

    }, 100);

}
function initializeSubjectResourceSearch(){

    const search =
        document.getElementById(
            "subject-resource-search"
        );

    if(!search) return;

    search.addEventListener("input", function(){

        const query =
            this.value.toLowerCase();

        document
            .querySelectorAll("#subject-resource-grid .resource-card")
            .forEach(card=>{

                const name =
                    card.dataset.resourceName;

                card.style.display =
                    name.includes(query)
                    ? ""
                    : "none";

            });

    });

}
/*==========================================================
                    GO BACK
==========================================================*/

function goBack() {

    history.back();

}

/*==========================================================
                    EVENT LISTENERS
==========================================================*/

function initEventListeners() {

    initializeNavbar();

    initializeThemeToggle();

    initializeDepartmentCards();

    initializeSemesterCards();
    initializeDepartmentSearch();
    initializeSearch();

    initializeFAQ();

    initializeBackToTop();

}


/*==========================================================
                    NAVBAR
==========================================================*/

function initializeNavbar() {

    const hamburger = document.getElementById("hamburger");

    if (hamburger) {

        hamburger.addEventListener("click", () => {

            document
                .getElementById("nav-links")
                .classList
                .toggle("open");

        });

    }

}


/*==========================================================
                    THEME
==========================================================*/

function initTheme() {

    const theme =

        localStorage.getItem("theme") || "light";

    document.documentElement.setAttribute(

        "data-theme",

        theme

    );

    updateThemeIcon(theme);

}


function initializeThemeToggle() {

    const toggle =

        document.getElementById("theme-toggle");

    if (!toggle) return;

    toggle.addEventListener(

        "click",

        toggleTheme

    );

}


function toggleTheme() {

    const current =

        document.documentElement.getAttribute(

            "data-theme"

        );

    const next =

        current === "dark"

            ? "light"

            : "dark";

    document.documentElement.setAttribute(

        "data-theme",

        next

    );

    localStorage.setItem(

        "theme",

        next

    );

    updateThemeIcon(next);

}


function updateThemeIcon(theme) {

    const icon =

        document.querySelector(

            "#theme-toggle i"

        );

    if (!icon) return;

    if (theme === "dark") {

        icon.className =

            "fa-solid fa-sun";

    }

    else {

        icon.className =

            "fa-solid fa-moon";

    }

}


/*==========================================================
                     DEPARTMENT
==========================================================*/

function initializeDepartmentCards() {

    document

        .querySelectorAll("#dept-grid .select-card")

        .forEach(card => {

            card.addEventListener("click", () => {

                appState.currentDept =

                    card.dataset.dept;

                showToast(

                    "Department : " +

                    appState.currentDept,

                    "info"

                );

                navigateTo("sem-view");

            });

        });

}

function initializeDepartmentSearch() {

    const input = document.getElementById("department-search");

    if (!input) return;

    input.addEventListener("input", function () {

        const query = this.value.toLowerCase();

        document.querySelectorAll("#dept-grid .select-card").forEach(card => {

            const deptName = card.querySelector("h3").textContent.toLowerCase();

            const deptDesc = card.querySelector("p").textContent.toLowerCase();

            if (
                deptName.includes(query) ||
                deptDesc.includes(query)
            ) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }

        });

    });

}

/*==========================================================
                     SEMESTER
==========================================================*/

function initializeSemesterCards() {

    document

        .querySelectorAll(".sem-card")

        .forEach(card => {

            card.addEventListener("click", () => {

                appState.currentSem =

                    card.dataset.sem;

                showToast(

                    "Semester " +

                    appState.currentSem +

                    " Selected",

                    "success"

                );

                navigateTo(

                    "dashboard-view"

                );

            });

        });

}


/*==========================================================
                     SEARCH
==========================================================*/

function initializeSearch() {

    const search =

        document.getElementById(

            "resource-search"

        );

    if (!search) return;

    search.addEventListener(

        "input",

        e => {

            filterSubjectCards(

                e.target.value.trim()

            );

        }

    );

}


/*==========================================================
                     FAQ
==========================================================*/

function initializeFAQ() {

    document

        .querySelectorAll(".faq-question")

        .forEach(item => {

            item.addEventListener(

                "click",

                () => {

                    const parent =

                        item.parentElement;

                    document

                        .querySelectorAll(".faq-item")

                        .forEach(faq => {

                            if (faq !== parent) {

                                faq.classList.remove(

                                    "open"

                                );

                            }

                        });

                    parent.classList.toggle(

                        "open"

                    );

                }

            );

        });

}


/*==========================================================
                 BACK TO TOP
==========================================================*/

function initializeBackToTop() {

    const button =

        document.getElementById(

            "back-to-top"

        );

    if (!button) return;

    window.addEventListener(

        "scroll",

        () => {

            if (window.scrollY > 400) {

                button.classList.add("show");

            }

            else {

                button.classList.remove("show");

            }

        }

    );

    button.addEventListener(

        "click",

        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }

    );

}
/*==========================================================
                 AUTHENTICATION STATUS
==========================================================*/

function checkPersistentAuthStatus() {

    const authBtn = document.getElementById("auth-nav-btn");

    if (!authBtn) return;

    if (isLoggedIn()) {

        const user = getCurrentUser();

        authBtn.innerHTML =
            '<i class="fa-solid fa-right-from-bracket"></i> Logout';

        authBtn.className = "btn btn-secondary";

        if (user) {

            console.log("Logged In User:", user.email);

        }

    }

    else {

        authBtn.innerHTML = "Login";

        authBtn.className = "btn btn-outline";

    }

}


/*==========================================================
                 NAVBAR LOGIN BUTTON
==========================================================*/

function handleNavbarAuthClick() {

    if (isLoggedIn()) {

        logout();

        return;

    }

    openAuthModal();

}


/*==========================================================
                     LOGIN REQUIRED
==========================================================*/

function requireLogin(action) {

    if (DEV_MODE || isLoggedIn()) {

        action();

        return;

    }

    postAuthRedirectActionCallback = action;

    openAuthModal();

}


/*==========================================================
                 AUTH MODAL
==========================================================*/

async function openAuthModal() {

    await waitForGoogleSDK();

    initializeGoogleSignIn();

    const modal = document.getElementById("auth-modal");

    if (modal) {

        modal.classList.add("open");

    }

}


function closeAuthModal() {

    const modal = document.getElementById("auth-modal");

    if (modal) {

        modal.classList.remove("open");

    }

}


/*==========================================================
                 PAYMENT MODAL
==========================================================*/

function openPaymentModal() {

    const modal = document.getElementById("payment-modal");

    if (modal) {

        modal.classList.add("open");

    }

}


function closePaymentModal() {

    const modal = document.getElementById("payment-modal");

    if (modal) {

        modal.classList.remove("open");

    }

}


/*==========================================================
                 DASHBOARD ACTIONS
==========================================================*/

function handleDashboardResource(category) {

    appState.activeResourceCategory = category;

    if (category === "mentorship") {

        navigateTo("mentorship-view");

        return;

    }

    requireLogin(() => {

        loadResourceViewLayout(category);

    });

}


/*==========================================================
                     API HELPERS
==========================================================*/

function getAuthHeaders() {

    const headers = {
        "Content-Type": "application/json"
    };

    const jwt = getJwt();

    if (jwt) {
        headers.Authorization = "Bearer " + jwt;
    }

    return headers;
}


/*==========================================================
                     GET REQUEST
==========================================================*/

async function apiGet(endpoint) {

    const response = await fetch(

        BACKEND_URL + endpoint,

        {

            method: "GET",

            headers: getAuthHeaders()

        }

    );

    if (response.status === 401) {

        logout();

        throw new Error("Unauthorized");

    }

    if (!response.ok) {

        throw new Error(

            "Server Error"

        );

    }

    return await response.json();

}


/*==========================================================
                     POST REQUEST
==========================================================*/

async function apiPost(endpoint, body) {

    const response = await fetch(

        BACKEND_URL + endpoint,

        {

            method: "POST",

            headers: getAuthHeaders(),

            body: JSON.stringify(body)

        }

    );

    if (response.status === 401) {

        logout();

        throw new Error("Unauthorized");

    }

    if (!response.ok) {

        throw new Error(

            "Server Error"

        );

    }

    return await response.json();

}


/*==========================================================
                     PUT REQUEST
==========================================================*/

async function apiPut(endpoint, body) {

    const response = await fetch(

        BACKEND_URL + endpoint,

        {

            method: "PUT",

            headers: getAuthHeaders(),

            body: JSON.stringify(body)

        }

    );

    if (!response.ok) {

        throw new Error(

            "Update Failed"

        );

    }

    return await response.json();

}


/*==========================================================
                     DELETE REQUEST
==========================================================*/

async function apiDelete(endpoint) {

    const response = await fetch(

        BACKEND_URL + endpoint,

        {

            method: "DELETE",

            headers: getAuthHeaders()

        }

    );

    if (!response.ok) {

        throw new Error(

            "Delete Failed"

        );

    }

    return await response.json();

}


/*==========================================================
                 BACKEND CONNECTION TEST
==========================================================*/

async function testBackendConnection() {

    try {

        const response = await fetch(
            BACKEND_URL + "/api/test"
        );

        const text = await response.text();

        console.log("Backend:", text);

    }

    catch (error) {

        console.error("Backend connection failed:", error);

    }

}
/*==========================================================
                 RESOURCE VIEW LOADER
==========================================================*/

function loadResourceViewLayout(category) {

    const titleMap = {

        notes: "📚 Verified Notes",

        pyqs: "📝 Previous Year Questions",

        organizers: "📂 Course Organizers"

    };

    const descMap = {

        notes:
            "High quality verified study materials.",

        pyqs:
            "University previous year questions.",

        organizers:
            "Mindmaps, formulas and revision sheets."

    };

    document.getElementById(
        "resource-view-title"
    ).textContent = titleMap[category];

    document.getElementById(
        "resource-view-desc"
    ).textContent = descMap[category];

    document.getElementById(
        "resource-search"
    ).value = "";

    renderSubjectResourceCards();

    navigateTo("resource-view");

}


/*==========================================================
                 SUBJECT CARDS
==========================================================*/

function renderSubjectResourceCards() {

    const container =
        document.getElementById(
            "resources-cards-grid"
        );

    container.innerHTML = "";

    const semesterKey =
        "sem" + appState.currentSem;

    let subjects =
        CONFIG.subjects[semesterKey] || [];

    // Provide demo fallback subjects when backend hasn't supplied any
    if (!subjects || subjects.length === 0) {

        // ================= SEMESTER 1 =================
        if (appState.currentSem === "1") {

            if (appState.currentDept === "IT") {
                subjects = [
                    "Mathematics IA (BS-M101)",
                    "Physics I (BS-PH101)",
                    "Basic Electrical and Electronics Engineering (ES-EE101)",
                    "English for Communication Skills (AEC-101)"
                ];
            }
            else if (appState.currentDept === "ME") {
                subjects = [
                    "Physics I (BS-PH101)",
                    "Mathematics IB (BS-M102)",
                    "Basic Electrical and Electronics Engineering (ES-EE101)",
                    "English for Communication Skills (AEC-101)"
                ];
            }
            else if (appState.currentDept === "ECE") {
                subjects = [
                    "Chemistry I (BS-CH201)",
                    "Mathematics IB (BS-M102)",
                    "Basic Electrical and Electronics Engineering (ES-EE101)",
                    "English for Communication Skills (AEC-101)"
                ];
            }
            else if (appState.currentDept === "ECS") {
                subjects = [
                    "Chemistry I (BS-CH201)",
                    "Mathematics IB (BS-M102)",
                    "Basic Electrical and Electronics Engineering (ES-EE101)",
                    "English for Communication Skills (AEC-101)"
                ];
            }
            else {
                subjects = [
                    "Mathematics IA (BS-M101)",
                    "Physics I (BS-PH101)",
                    "Basic Electrical and Electronics Engineering (ES-EE101)",
                    "English for Communication Skills (AEC-101)"
                ];
            }
        }
        // ================= SEMESTER 2 ================
        else if (appState.currentSem === "2") {
          // ECE & ECS
          if (
            appState.currentDept === "ECE" ||
            appState.currentDept === "ECS"
          ) {
            subjects = [
              "Physics I (BS-PH101)",
              "Mathematics IIB (BS-M202)",
              "Programming for Problem Solving and AI (ES-CS201)",
              "Biology for Engineers (BS-BI201)",
              "Environmental Science (VAC-201)"
            ];
          }
          // IT, ME and other departments
          else {
            subjects = [
              "Chemistry I (BS-CH201)",
              "Programming for Problem Solving and AI (ES-CS201)",
              "Mathematics IIA (BS-M201)",
              "Biology for Engineers (BS-BI201)",
              "Environmental Science (VAC-201)"
            ];
          }
        }
    }
    if (subjects.length === 0) {

        container.innerHTML = `

        <div class="empty-box">

            <h3>No Subjects Found</h3>

            <p>
                Subjects will appear here after
                connecting to the backend.
            </p>

        </div>

        `;

        return;

    }

    subjects.forEach(subject => {

        createSubjectCard(subject);

    });

}


/*==========================================================
            CREATE SUBJECT CARD
==========================================================*/

function createSubjectCard(subject) {

    const container =
        document.getElementById(
            "resources-cards-grid"
        );

    const card =
        document.createElement("div");

    // Add both resource-card and subject-resource-card so filters target them correctly
card.className = "resource-card subject-resource-card";
card.dataset.subjectName = subject.toLowerCase();

const currentCategory = appState.activeResourceCategory;

let icon = "fa-book-open";
let badge = "NOTES";

if (currentCategory === "pyqs") {
    icon = "fa-file-lines";
    badge = "PYQ";
}
if (currentCategory === "organizers") {
    icon = "fa-folder-tree";
    badge = "ORGANIZER";
}

card.innerHTML = `
    <div class="resource-top">
        <div class="resource-icon">
            <i class="fa-solid ${icon}"></i>
        </div>
        <span class="resource-type">${badge}</span>
    </div>

    <h3 class="resource-title">${subject}</h3>

    <p class="resource-sub">
        High quality verified study material prepared for Semester ${appState.currentSem}.
    </p>

    <div class="resource-meta">
        <span class="resource-chip">${appState.currentDept}</span>
        <span class="resource-chip">Semester ${appState.currentSem}</span>
    </div>

    <div class="resource-actions">
        <button class="btn btn-primary" onclick="openSubjectResources('${subject}')">
            <i class="fa-solid fa-arrow-right"></i>
            View Resources
        </button>
    </div>
`;

container.appendChild(card);

}


/*==========================================================
            ACTION BUTTONS
==========================================================*/

function generateActionButtons(subject){

    switch(appState.activeResourceCategory){

        case "notes":

            return `

            <div class="resource-action-list">

                <button
                    class="btn btn-primary btn-full"
                    onclick="viewNotes('${subject}')">

                    View Notes

                </button>

                <button
                    class="btn btn-secondary btn-full"
                    onclick="downloadNotes('${subject}')">

                    Download PDF

                </button>

            </div>

            `;

        case "pyqs":

            return `

            <div class="resource-action-list">

                <button
                    class="btn btn-primary btn-full"
                    onclick="viewPYQs('${subject}')">

                    View PYQs

                </button>

                <button
                    class="btn btn-secondary btn-full"
                    onclick="downloadPYQs('${subject}')">

                    Download

                </button>

            </div>

            `;

        case "organizers":

            return `

            <div class="resource-action-list">

                <button
                    class="btn btn-primary btn-full"
                    onclick="viewOrganizer('${subject}')">

                    Open Organizer

                </button>

                <button
                    class="btn btn-secondary btn-full"
                    onclick="downloadOrganizer('${subject}')">

                    Download

                </button>

            </div>

            `;

        default:

            return "";

    }

}


/*==========================================================
                SEARCH FILTER
==========================================================*/

function filterSubjectCards(query){

    const search =
        query.toLowerCase();

    // Target the subject cards (we add subject-resource-card class when creating them)
    document

        .querySelectorAll(
            ".resource-card.subject-resource-card"
        )

        .forEach(card=>{

            const subject =
                card.dataset.subjectName;

            card.style.display =
                subject.includes(search)
                ? "block"
                : "none";

        });

}


/*==========================================================
                NOTES
==========================================================*/

async function viewNotes(subject){

    try{

        const notes =
            await apiGet(

                "/api/notes/"

                + encodeURIComponent(subject)

            );

        console.log(notes);

        showToast(

            "Notes Loaded",

            "success"

        );

    }

    catch(error){

        console.error(error);

    }

}


function downloadNotes(subject){

    window.open(

        BACKEND_URL

        +

        "/api/notes/download/"

        +

        encodeURIComponent(subject),

        "_blank"

    );

}


/*==========================================================
                PYQS
==========================================================*/

async function viewPYQs(subject){

    try{

        const pyqs =
            await apiGet(

                "/api/pyqs/"

                +

                encodeURIComponent(subject)

            );

        console.log(pyqs);

        showToast(

            "PYQs Loaded",

            "success"

        );

    }

    catch(error){

        console.error(error);

    }

}


function downloadPYQs(subject){

    window.open(

        BACKEND_URL

        +

        "/api/pyqs/download/"

        +

        encodeURIComponent(subject),

        "_blank"

    );

}
/*==========================================================
                    ORGANIZERS
==========================================================*/

async function viewOrganizer(subject){

    try{

        const organizer = await apiGet(

            "/api/organizers/" +

            encodeURIComponent(subject)

        );

        console.log(organizer);

        showToast(

            "Organizer Loaded",

            "success"

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to load organizer",

            "error"

        );

    }

}


function downloadOrganizer(subject){

    window.open(

        BACKEND_URL +

        "/api/organizers/download/" +

        encodeURIComponent(subject),

        "_blank"

    );

}


/*==========================================================
                PREMIUM MEMBERSHIP
==========================================================*/

function isPremiumUser(){

    const user = getCurrentUser();

    if(!user) return false;

    return user.role === "PREMIUM"

        ||

        localStorage.getItem("premium") === "true";

}


/*==========================================================
            PREMIUM PAGE
==========================================================*/

function renderMentorshipPricingCard(){

    const container =

        document.getElementById(

            "premium-pricing-box"

        );

    if(!container) return;

    if(isPremiumUser()){

        container.innerHTML = `

            <div class="success-box-animated">

                <i class="fa-solid fa-circle-check"></i>

                <h3>Premium Activated</h3>

                <p>

                    Welcome to Premium Mentorship

                </p>

                <button

                    class="btn btn-primary btn-full"

                    onclick="enterMentorshipRoom()">

                    Open Dashboard

                </button>

            </div>

        `;

    }

    else{

        container.innerHTML = `

            <h3>

                Premium Mentorship

            </h3>

            <div class="price-pill">

                ₹59

            </div>

            <p>

                Lifetime Access

            </p>

            <button

                class="btn btn-primary btn-full"

                onclick="buyPremium()">

                Buy Now

            </button>

        `;

    }

}


/*==========================================================
                BUY PREMIUM
==========================================================*/

function buyPremium(){

    if(!isLoggedIn()){

        requireLogin(

            ()=>{

                openPaymentModal();

            }

        );

        return;

    }

    if(isPremiumUser()){
        enterMentorshipRoom();
        return;
    }

    openPaymentModal();

}


/*==========================================================
            ENTER PREMIUM ROOM
==========================================================*/

function enterMentorshipRoom(){

    if(!isPremiumUser()){
        showToast("Premium Membership Required","warning");
        return;
    }

    window.location.href = "premium-dashboard.html";

}


/*==========================================================
            PAYMENT
==========================================================*/

async function processPayment(){

    try{

        const payment =

            await apiPost(

                "/api/payment/create-order",

                {

                    amount:59

                }

            );

        console.log(payment);

        showToast(

            "Payment Order Created",

            "success"

        );

        launchPaymentGateway(payment);

    }

    catch(error){

        console.error(error);

        showToast(

            "Payment Failed",

            "error"

        );

    }

}


/*==========================================================
            PAYMENT GATEWAY
==========================================================*/

function launchPaymentGateway(order){

    /*
        Razorpay Integration

        Will be added later.

        order.id

        order.amount

        order.currency

    */

    console.log(order);

}


/*==========================================================
            PAYMENT SUCCESS
==========================================================*/

async function verifyPayment(

    paymentId,

    orderId,

    signature

){

    try{

        await apiPost(

            "/api/payment/verify",

            {

                paymentId,

                orderId,

                signature

            }

        );

        localStorage.setItem(

            "premium",

            "true"

        );

        closePaymentModal();

        renderMentorshipPricingCard();

        showToast(

            "Premium Activated",

            "success"

        );

        window.location.href = "premium-dashboard.html";

    }

    catch(error){

        console.error(error);

    }

}


/*==========================================================
            PAYMENT BUTTON
==========================================================*/

function simulatePaymentProcessing(){

    processPayment();
}
/*==========================================================
                TOAST NOTIFICATIONS
==========================================================*/

function showToast(message, type = "info") {

    const container = document.getElementById("toast-container");

    if (!container) return;

    const toast = document.createElement("div");

    toast.className = "toast " + type;

    let icon = "fa-circle-info";

    switch (type) {

        case "success":
            icon = "fa-circle-check";
            break;

        case "error":
            icon = "fa-circle-xmark";
            break;

        case "warning":
            icon = "fa-triangle-exclamation";
            break;

        default:
            icon = "fa-circle-info";
    }

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 100);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}


/*==========================================================
                LOADING UTILITIES
==========================================================*/

function showLoader() {

    const loader = document.getElementById("loader");

    if (!loader) return;

    loader.classList.remove("hidden");

    loader.style.opacity = "1";

}


function hideLoader() {

    const loader = document.getElementById("loader");

    if (!loader) return;

    loader.style.opacity = "0";

    setTimeout(() => {

        loader.classList.add("hidden");

    }, 300);

}


/*==========================================================
                ERROR HANDLER
==========================================================*/

function handleApiError(error) {

    console.error(error);

    if (error.message === "Unauthorized") {

        showToast(

            "Please login again.",

            "warning"

        );

        return;

    }

    showToast(

        "Something went wrong.",

        "error"

    );

}


/*==========================================================
                EMPTY STATE
==========================================================*/

function showEmptyState(message) {

    const grid = document.getElementById(

        "resources-cards-grid"

    );

    if (!grid) return;

    grid.innerHTML = `

        <div class="empty-box">

            <i class="fa-solid fa-folder-open"></i>

            <h3>No Resources</h3>

            <p>${message}</p>

        </div>

    `;

}


/*==========================================================
            COPY TO CLIPBOARD
==========================================================*/

function copyText(text) {

    navigator.clipboard.writeText(text)

        .then(() => {

            showToast(

                "Copied",

                "success"

            );

        })

        .catch(() => {

            showToast(

                "Copy Failed",

                "error"

            );

        });

}


/*==========================================================
                FORMAT DATE
==========================================================*/

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString(

        "en-IN",

        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }

    );

}


/*==========================================================
                FILE DOWNLOAD
==========================================================*/

function downloadFile(url) {

    window.open(

        url,

        "_blank"

    );

}


/*==========================================================
            ESC KEY CLOSE MODALS
==========================================================*/

document.addEventListener(

    "keydown",

    event => {

        if (event.key !== "Escape") {

            return;

        }

        closeAuthModal();

        closePaymentModal();

    }

);


/*==========================================================
        CLICK OUTSIDE TO CLOSE MODALS
==========================================================*/

window.addEventListener(

    "click",

    event => {

        const authModal =

            document.getElementById(

                "auth-modal"

            );

        const paymentModal =

            document.getElementById(

                "payment-modal"

            );

        if (

            event.target === authModal

        ) {

            closeAuthModal();

        }

        if (

            event.target === paymentModal

        ) {

            closePaymentModal();

        }

    }

);


/*==========================================================
            GLOBAL FETCH WRAPPER
==========================================================*/

async function executeRequest(request) {

    try {

        showLoader();

        const result = await request();

        hideLoader();

        return result;

    }

    catch (error) {

        hideLoader();

        handleApiError(error);

        throw error;

    }

}


/*==========================================================
                INITIAL BACKEND CHECK
==========================================================*/

window.addEventListener(

    "load",

    () => {

        console.log(

            "SemesterX Frontend Loaded"

        );

        if (isLoggedIn()) {

            testBackendConnection();

        }

    }

);
function previewResource(previewUrl, title, downloadUrl) {

    document.getElementById("pdf-title").textContent = title;

    document.getElementById("pdf-preview-body").innerHTML = `
        <iframe
            src="${previewUrl}"
            width="100%"
            height="100%"
            style="
                width:100%;
                height:100%;
                border:none;
            ">
        </iframe>
    `;

    // Connect the Download button inside PDF viewer
    const downloadButton =
        document.getElementById("pdf-download-btn");

    if (downloadButton) {

        downloadButton.onclick = function () {

            downloadResource(downloadUrl, title);

        };

    }

    document
        .getElementById("pdf-preview-modal")
        .classList.add("open");
}
function closePdfPreview(){

    document
        .getElementById("pdf-preview-modal")
        .classList.remove("open");

}

function downloadResource(downloadUrl, title = "document.pdf") {

    if (!downloadUrl) {

        showToast(
            "Download link is not available.",
            "error"
        );

        return;

    }

    try {

        // Google Drive download links work more reliably
        // when the browser is navigated directly to them.
        window.location.href = downloadUrl;

        showToast(
            "Download started!",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Download error:",
            error
        );

        showToast(
            "Unable to download this PDF.",
            "error"
        );

    }

}
function openSubjectResources(subject){

    appState.selectedSubject = subject;

    document.getElementById("subject-title").textContent = subject;

    loadSubjectResources(subject);

    navigateTo("subject-resource-view");

}
function loadSubjectResources(subject){

    const container =
        document.getElementById("subject-resource-grid");

    container.innerHTML = "";

    let demoResources = [];

    // ---------------- NOTES ----------------

    if(appState.activeResourceCategory === "notes"){
      if(subject.includes("Physics")){
        demoResources = [
          { name:"Mechanics Notes.pdf", type:"PDF", size:"2.3 MB" },
          { name:"Optics Notes.pdf", type:"PDF", size:"2.1 MB" },
          { name:"Electromagnetism Notes.pdf", type:"PDF", size:"2.4 MB" },
          { name:"Dielectric & Magnetic Properties of Materials Notes.pdf", type:"PDF", size:"1.9 MB" },
          { name:"Quantum Mechanics Notes.pdf", type:"PDF", size:"2.0 MB" },
          { name:"Statistical Mechanics Notes.pdf", type:"PDF", size:"1.8 MB" },
          { name:"Important Questions.pdf", type:"PDF", size:"950 KB" },
          { name:"Formula Sheet.pdf", type:"PDF", size:"630 KB" , preview:"https://drive.google.com/file/d/1D3fihKQdh9GUklnr9f-cYLRbnDpINV-c/preview", download:"https://drive.google.com/uc?export=download&id=1D3fihKQdh9GUklnr9f-cYLRbnDpINV-c"}
        ];
      }
      // ---------- Mathematics-1A (BS-M101)----------
      else if(subject.includes("Mathematics IA")){
        demoResources = [
            { name:"Calculus (Integration) Notes.pdf", type:"PDF", size:"2.3 MB" },
            { name:"Calculus (Differentiation) Notes.pdf", type:"PDF", size:"2.2 MB" },
            { name:"Matrices Notes.pdf", type:"PDF", size:"2.0 MB" },
            { name:"Vector Spaces Notes.pdf", type:"PDF", size:"1.9 MB" },
            { name:"Important Questions.pdf", type:"PDF", size:"950 KB" },
            { name:"Formula Sheet.pdf", type:"PDF", size:"450 KB" }
        ];
      }
      // ---------- Basic Electrical Engineering (ES-EE101)----------
      else if(subject.includes("Electrical")){
        demoResources = [
          { name:"DC Circuits Notes.pdf", type:"PDF", size:"2.3 MB" },
          { name:"AC Circuits Notes.pdf", type:"PDF", size:"2.2 MB" },
          { name:"Transformers Notes.pdf", type:"PDF", size:"2.1 MB" },
          { name:"Electrical Machines Notes.pdf", type:"PDF", size:"2.0 MB" },
          { name:"Power Converters Notes.pdf", type:"PDF", size:"1.9 MB" },
          { name:"Electrical Installation Notes.pdf", type:"PDF", size:"1.8 MB" },
          { name:"Important Questions.pdf", type:"PDF", size:"950 KB" },
          { name:"Formula Sheet.pdf", type:"PDF", size:"450 KB" }
        ];
      }
      // ---------- Mathematics IIA (BS-M201) ----------
      else if(subject.includes("Mathematics IIA")){
        demoResources = [
          {
            name:"Basic Probability Notes.pdf",
            type:"PDF",
            size:"2.2 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },

          {
            name:"Continuous Probability Distribution Notes.pdf",
            type:"PDF",
            size:"2.3 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },

          {
            name:"Bivariate Distribution Notes.pdf",
            type:"PDF",
            size:"2.1 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Basic Statistics Notes.pdf",
            type:"PDF",
            size:"2.0 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Applied Statistics Notes.pdf",
            type:"PDF",
            size:"2.1 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Small Samples Notes.pdf",
            type:"PDF",
            size:"1.9 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Important Questions.pdf",
            type:"PDF",
            size:"1.9 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Formula Sheet.pdf",
            type:"PDF",
            size:"1.9 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          }
        ];
      }
      // ---------- Chemistry I (BS-CH201) ----------
      else if(subject.includes("Chemistry")){
        demoResources = [
          {
            name:"Atomic and Molecular Structure Notes.pdf",
            type:"PDF",
            size:"2.1 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Spectroscopic Techniques and Application Notes.pdf",
            type:"PDF",
            size:"2.3 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Intermolecular Forces Notes.pdf",
            type:"PDF",
            size:"2.0 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Free Energy and Chemical Equilibria Notes.pdf",
            type:"PDF",
            size:"2.2 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Periodic Properties Notes.pdf",
            type:"PDF",
            size:"2.0 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Stereochemistry Notes.pdf",
            type:"PDF",
            size:"2.1 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Organic Reactions and Synthesis of Drug Molecule Notes.pdf",
            type:"PDF",
            size:"2.4 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Important Questions.pdf",
            type:"PDF",
            size:"1.0 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Formula Sheet.pdf",
            type:"PDF",
            size:"758 KB",
            preview:"https://drive.google.com/file/d/1ME5axFEKkfaKtYFOq-uUqIoMZXtX4g19/preview",
            download:"https://drive.google.com/uc?export=download&id=1ME5axFEKkfaKtYFOq-uUqIoMZXtX4g19"
          },
          {
            name:"Reaction Sheet.pdf",
            type:"PDF",
            size:"500 KB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          }
        ];
      }
      // ---------- Programming for Problem Solving (ES-CS201 / ES-CS201) ---------
      else if(subject.includes("Programming for Problem Solving")){
        demoResources = [
          {
            name:"Introduction to Programming Notes.pdf",
            type:"PDF",
            size:"2.0 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Arithmetic Expression and Precedence Notes.pdf",
            type:"PDF",
            size:"2.1 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Conditional Branching and Loops Notes.pdf",
            type:"PDF",
            size:"2.3 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Arrays (1D, 2D) Notes.pdf",
            type:"PDF",
            size:"2.2 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Basic Algorithm (Searching, Sorting) Notes.pdf",
            type:"PDF",
            size:"2.4 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Function Notes.pdf",
            type:"PDF",
            size:"1.9 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Recursion Notes.pdf",
            type:"PDF",
            size:"1.8 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Structure Notes.pdf",
            type:"PDF",
            size:"2.0 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Pointers Notes.pdf",
            type:"PDF",
            size:"2.2 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"File Handling Notes.pdf",
            type:"PDF",
            size:"2.1 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Important Questions.pdf",
            type:"PDF",
            size:"2.1 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          },
          {
            name:"Coding Questions.pdf",
            type:"PDF",
            size:"2.1 MB",
            preview:"YOUR_PREVIEW_LINK",
            download:"YOUR_DOWNLOAD_LINK"
          }
        ];
      }
    }
    // ---------------- PYQS ----------------
    else if(appState.activeResourceCategory === "pyqs"){
      // ---------- Basic Electrical Engineering ----------
      if(subject.includes("Electrical")){
        demoResources = [
          {
            name:"2018-19 PYQ.pdf",
            type:"PDF",
            size:"195 KB",
            preview:"https://drive.google.com/file/d/1yqkUU43w77lYlw527kgQwhOjJw0DnRDO/preview",
            download:"https://drive.google.com/uc?export=download&id=1yqkUU43w77lYlw527kgQwhOjJw0DnRDO"
          },

          {
            name:"2019-20 PYQ.pdf",
            type:"PDF",
            size:"148 KB",
            preview:"https://drive.google.com/file/d/1H2V9qZjxpUaIvmpdJvrFwY1EFZJA4fwg/preview",
            download:"https://drive.google.com/uc?export=download&id=1H2V9qZjxpUaIvmpdJvrFwY1EFZJA4fwg"
          },

          {
            name:"2022-23 PYQ.pdf",
            type:"PDF",
            size:"70 KB",
            preview:"https://drive.google.com/file/d/1GzCt-fKF6bLNj0tvHUs6BTONYOfvSxTe/preview",
            download:"https://drive.google.com/uc?export=download&id=1GzCt-fKF6bLNj0tvHUs6BTONYOfvSxTe"
          },
          {
            name:"2023-24 PYQ.pdf",
            type:"PDF",
            size:"72 KB",
            preview:"https://drive.google.com/file/d/1DwMckKmWilkyy1Ngs175KymU41RQ9hMw/preview",
            download:"https://drive.google.com/uc?export=download&id=1DwMckKmWilkyy1Ngs175KymU41RQ9hMw"
          },
          {
            name:"2025-26 PYQ.pdf",
            type:"PDF",
            size:"90 KB",
            preview:"https://drive.google.com/file/d/1bQRj55eAzui0btnsRCb1yjHYcivbt5qI/preview",
            download:"https://drive.google.com/uc?export=download&id=1bQRj55eAzui0btnsRCb1yjHYcivbt5qI"
          }
        ];
      }
      // ---------- Physics I (BS-PH101) ----------
      else if(subject.includes("Physics")){
        demoResources = [
          {
            name:"2018-19 PYQ.pdf",
            type:"PDF",
            size:"1.25MB",
            preview:"https://drive.google.com/file/d/1mtXQrM-mz8V9o2QDZpNNVUeY8maexCpN/preview",
            download:"https://drive.google.com/uc?export=download&id=1mtXQrM-mz8V9o2QDZpNNVUeY8maexCpN"
          },
          {
            name:"2019-20 PYQ.pdf",
            type:"PDF",
            size:"531KB",
            preview:"https://drive.google.com/file/d/1ipW2ESHBDq-XFzJcK9tCgsrsBXRWLYHH/preview",
            download:"https://drive.google.com/uc?export=download&id=1ipW2ESHBDq-XFzJcK9tCgsrsBXRWLYHH"
          },
          {
            name:"2022-23 PYQ.pdf",
            type:"PDF",
            size:"1.43MB",
            preview:"https://drive.google.com/file/d/1W8VavQtMqCw6EOECYjziSIKb3jhCuye9/preview",
            download:"https://drive.google.com/uc?export=download&id=1W8VavQtMqCw6EOECYjziSIKb3jhCuye9"
          },
          {
            name:"2023-24 PYQ.pdf",
            type:"PDF",
            size:"1.27MB",
            preview:"https://drive.google.com/file/d/1ZvQ6yOZqVkPlJvqu5SQ0me3HnKEyUz2B/preview",
            download:"https://drive.google.com/uc?export=download&id=1ZvQ6yOZqVkPlJvqu5SQ0me3HnKEyUz2B"
          },
          {
            name:"2024-25 PYQ.pdf",
            type:"PDF",
            size:"1.29MB",
            preview:"https://drive.google.com/file/d/1k9Womi55_J4lmHZrYaPivlYl7yszMCWK/preview",
            download:"https://drive.google.com/uc?export=download&id=1k9Womi55_J4lmHZrYaPivlYl7yszMCWK"
          },
          {
            name:"2025-26 PYQ.pdf",
            type:"PDF",
            size:"85.8KB",
            preview:"https://drive.google.com/file/d/1d-FiSE_t5p5oYbUn7h0UOvaeLbFShK_7/preview",
            download:"https://drive.google.com/uc?export=download&id=1d-FiSE_t5p5oYbUn7h0UOvaeLbFShK_7"
          }
        ];
      }
      // ---------- Programming for Problem Solving and AI (ES-CS201) ----------
      else if(subject.includes("Programming for Problem Solving")){
        demoResources = [
          {
            name:"2022-23 PYQ.pdf",
            type:"PDF",
            size:"53.5KB",
            preview:"https://drive.google.com/file/d/13oXr4dFwvS_40bjuR0SAJ8S5-5NUF6Ar/preview",
            download:"https://drive.google.com/uc?export=download&id=13oXr4dFwvS_40bjuR0SAJ8S5-5NUF6Ar"
          },
          {
            name:"2023-24 PYQ.pdf",
            type:"PDF",
            size:"70.4KB",
            preview:"https://drive.google.com/file/d/1Ts6gZTsEnBvRLBNWGG4on0f94T2P0J6M/preview",
            download:"https://drive.google.com/uc?export=download&id=1Ts6gZTsEnBvRLBNWGG4on0f94T2P0J6M"
          },
          {
            name:"2024-25 PYQ.pdf",
            type:"PDF",
            size:"58.6KB",
            preview:"https://drive.google.com/file/d/14XpbZewspgGxmomZzn1ER-IPo4nKysP3/preview",
            download:"https://drive.google.com/uc?export=download&id=14XpbZewspgGxmomZzn1ER-IPo4nKysP3"
          },
          {
            name:"2025-26 PYQ.pdf",
            type:"PDF",
            size:"372KB",
            preview:"https://drive.google.com/file/d/1AP7rki9I3IP7W5-iPXsbifURTwj0sJl4/preview",
            download:"https://drive.google.com/uc?export=download&id=1AP7rki9I3IP7W5-iPXsbifURTwj0sJl4"
          }
        ];
      }
      // ---------- Chemistry I (BS-CH201) ----------
      else if(subject.includes("Chemistry I")){
        demoResources = [
          {
            name:"2018-19 PYQ.pdf",
            type:"PDF",
            size:"125KB",
            preview:"https://drive.google.com/file/d/1LLWuaTaUG1vXe36Ag8tZkZycnR20itxZ/preview",
            download:"https://drive.google.com/uc?export=download&id=1LLWuaTaUG1vXe36Ag8tZkZycnR20itxZ"
          },
          {
            name:"2019-20 PYQ.pdf",
            type:"PDF",
            size:"300KB",
            preview:"https://drive.google.com/file/d/11J_ou1GaDQ2Rtc-cJOVIt1C8ZXbJXoWG/preview",
            download:"https://drive.google.com/uc?export=download&id=11J_ou1GaDQ2Rtc-cJOVIt1C8ZXbJXoWG"
          },
          {
            name:"2022-23 PYQ.pdf",
            type:"PDF",
            size:"80KB",
            preview:"https://drive.google.com/file/d/14kcphXqtcfqD6Y4fnzkNx9WtDLeTh6I7/preview",
            download:"https://drive.google.com/uc?export=download&id=14kcphXqtcfqD6Y4fnzkNx9WtDLeTh6I7"
          },
          {
            name:"2023-24 PYQ.pdf",
            type:"PDF",
            size:"96KB",
            preview:"https://drive.google.com/file/d/1-e0f4WSls_0NgmejXJN3V8fTXr8wusrA/preview",
            download:"https://drive.google.com/uc?export=download&id=1-e0f4WSls_0NgmejXJN3V8fTXr8wusrA"
          },
          {
            name:"2024-25 PYQ.pdf",
            type:"PDF",
            size:"75KB",
            preview:"https://drive.google.com/file/d/19zY51E9JnvBzqLYD8R8h-1cnFBQz8Tok/preview",
            download:"https://drive.google.com/uc?export=download&id=19zY51E9JnvBzqLYD8R8h-1cnFBQz8Tok"
          },
          {
            name:"2025-26 PYQ.pdf",
            type:"PDF",
            size:"863KB",
            preview:"https://drive.google.com/file/d/15Cws954Kd79D7xisowxKH4WhElpQZtkf/preview",
            download:"https://drive.google.com/uc?export=download&id=15Cws954Kd79D7xisowxKH4WhElpQZtkf"
          }
        ];
      }
      // ---------- Mathematics IA (BS-M101) ----------
      else if(subject.includes("Mathematics IA")){
        demoResources = [
          {
            name:"2019-20 PYQ.pdf",
            type:"PDF",
            size:"70.1KB",
            preview:"https://drive.google.com/file/d/1HyCjB6hqebiPX4DhpZqaTdBMFl6DVdP4/preview",
            download:"https://drive.google.com/uc?export=download&id=1HyCjB6hqebiPX4DhpZqaTdBMFl6DVdP4"
          },
          {
            name:"2022-23 PYQ.pdf",
            type:"PDF",
            size:"58KB",
            preview:"https://drive.google.com/file/d/1gOHbYm_zbJu-zt0cYh1k1M-xdq4R3FZ2/preview",
            download:"https://drive.google.com/uc?export=download&id=1gOHbYm_zbJu-zt0cYh1k1M-xdq4R3FZ2"
          },
          {
            name:"2023-24 PYQ.pdf",
            type:"PDF",
            size:"118KB",
            preview:"https://drive.google.com/file/d/1WRi5EU_lrdVRqOzqIhTeRKUVD5R5nC7d/preview",
            download:"https://drive.google.com/uc?export=download&id=1WRi5EU_lrdVRqOzqIhTeRKUVD5R5nC7d"
          },
          {
            name:"2024-25 PYQ.pdf",
            type:"PDF",
            size:"83.6KB",
            preview:"https://drive.google.com/file/d/1ozv_6CwFO89MMjF7EvN6c4lPs0kJ7BNd/preview",
            download:"https://drive.google.com/uc?export=download&id=1ozv_6CwFO89MMjF7EvN6c4lPs0kJ7BNd"
          },
          {
            name:"2025-26 PYQ.pdf",
            type:"PDF",
            size:"72.8KB",
            preview:"https://drive.google.com/file/d/17EqvsnmWnDxCcgTEj5-eLa895EMa7vCd/preview",
            download:"https://drive.google.com/uc?export=download&id=17EqvsnmWnDxCcgTEj5-eLa895EMa7vCd"
          }
        ];
      }
      // ---------- Mathematics IIA (BS-M201) ----------
      else if(subject.includes("Mathematics IIA")){
        demoResources = [
          {
            name:"2022-23 PYQ.pdf",
            type:"PDF",
            size:"90.8KB",
            preview:"https://drive.google.com/file/d/1qpQhcXLZoM04JAolkMeioq4bQ_JzGx7U/preview",
            download:"https://drive.google.com/file/d/1qpQhcXLZoM04JAolkMeioq4bQ_JzGx7U/preview"
          },
          {
            name:"2023-24 PYQ.pdf",
            type:"PDF",
            size:"126KB",
            preview:"https://drive.google.com/file/d/1c_63DAjEQG3GGv0khoj47Rub4zJhgbhJ/preview",
            download:"https://drive.google.com/uc?export=download&id=1c_63DAjEQG3GGv0khoj47Rub4zJhgbhJ"
          },
          {
            name:"2024-25 PYQ.pdf",
            type:"PDF",
            size:"91.9KB",
            preview:"https://drive.google.com/file/d/10OhC2YD4ShVJ5WMYv4xmOP7SHugMe_--/preview",
            download:"https://drive.google.com/uc?export=download&id=10OhC2YD4ShVJ5WMYv4xmOP7SHugMe_--"
          },
          {
            name:"2025-26 PYQ.pdf",
            type:"PDF",
            size:"101KB",
            preview:"https://drive.google.com/file/d/1v0xwbWk8Joepn3B6Sbxd5GI4XN5i6325/preview",
            download:"https://drive.google.com/uc?export=download&id=1v0xwbWk8Joepn3B6Sbxd5GI4XN5i6325"
          }
        ];
      }
      else{
        demoResources = [
          {
            name:"Coming Soon",
            type:"PDF",
            size:"--"
          }
        ];
      }
    }
    // ---------------- ORGANIZERS ----------------

    else{
        demoResources = [
          {
            name:"Formula Sheet.pdf",
            type:"PDF",
            size:"450 KB"
          },

          {
            name:"Mind Map.pdf",
            type:"PDF",
            size:"620 KB"
          },
          {
            name:"Revision Sheet.pdf",
            type:"PDF",
            size:"800 KB"
          }
        ];
    }
    demoResources.forEach(resource=>{

        const card = document.createElement("div");

        card.className = "resource-card";
        card.dataset.resourceName = resource.name.toLowerCase();
        card.innerHTML = `

            <div class="resource-top">

                <div class="resource-icon">

                    <i class="fa-solid fa-file-pdf"></i>

                </div>

                <span class="resource-type">

                    ${resource.type}

                </span>

            </div>

            <h3 class="resource-title">

                ${resource.name}

            </h3>

            <p class="resource-sub">

                ${subject}

            </p>

            <div class="resource-meta">

                <span class="resource-chip">

                    ${resource.size}

                </span>

            </div>

            <div class="resource-actions">

                <button
                    class="btn btn-outline"
                    onclick="${resource.preview ? `previewResource('${resource.preview}','${resource.name}','${resource.download || ""}')` : `showToast('PYQs will be uploaded soon.','info')`}"
                    <i class="fa-solid fa-eye"></i>
                    Preview
                </button>

                <button
                    class="btn btn-primary"
                    onclick="${resource.download
                               ? `downloadResource('${resource.download}','${resource.name}')`
                               : `showToast('Download will be available soon.','info')`
                    }">
                    <i class="fa-solid fa-download"></i>
                    Download
                </button>

            </div>

        `;

        container.appendChild(card);

    });
  // ================= PREMIUM BANNER =================

let premiumBanner = "";

if (appState.activeResourceCategory === "pyqs") {

    premiumBanner = `
    <div class="premium-pyq-banner">

        <div class="premium-pyq-left">

            <span class="premium-tag">
                <i class="fa-solid fa-crown"></i>
                ELITE ACCESS
            </span>

            <h2>
                Need More Previous Year Questions?
            </h2>

            <p>
                Unlock 10+ Years of PYQs, detailed solutions,
                chapter-wise collections, predicted questions,
                and premium exam resources.
            </p>

            <ul>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    10+ Years Previous Year Questions
                </li>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    Step-by-Step Solutions
                </li>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    Chapter-wise PYQs
                </li>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    Expected Questions
                </li>

            </ul>

        </div>

        <div class="premium-pyq-right">

            <button
                class="btn btn-primary premium-upgrade-btn"
                onclick="navigateTo('mentorship-view')">

                <i class="fa-solid fa-crown"></i>

                Become Elite Member

            </button>

        </div>

    </div>
    `;
}
// ---------------- ORGANIZERS ----------------

else if (appState.activeResourceCategory === "organizers") {

    premiumBanner = `
    <div class="premium-pyq-banner">

        <div class="premium-pyq-left">

            <span class="premium-tag">
                <i class="fa-solid fa-crown"></i>
                ELITE ACCESS
            </span>

            <h2>
                Unlock Premium Study Organizers
            </h2>

            <p>
                Organize your preparation smarter with exclusive revision
                resources, visual learning tools, and premium study materials
                designed for faster learning and last-minute revision.
            </p>

            <ul>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    Special Notes
                </li>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    Mind Maps
                </li>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    Last-Minute Revision Sheets
                </li>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    Cheat Sheets
                </li>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    Revision Flashcards
                </li>

            </ul>

        </div>

        <div class="premium-pyq-right">

            <button
                class="btn btn-primary premium-upgrade-btn"
                onclick="navigateTo('mentorship-view')">

                <i class="fa-solid fa-crown"></i>

                Become Elite Member

            </button>

        </div>

    </div>
    `;
}

else if (appState.activeResourceCategory === "notes") {

    premiumBanner = `
    <div class="premium-pyq-banner">

        <div class="premium-pyq-left">

            <span class="premium-tag">
                <i class="fa-solid fa-crown"></i>
                ELITE ACCESS
            </span>

            <h2>
                Need More Premium Notes?
            </h2>

            <p>
                Unlock complete handwritten notes, chapter-wise
                study material, quick revision sheets,
                important questions, and premium exam resources.
            </p>

            <ul>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    Complete Handwritten Notes
                </li>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    Chapter-wise Study Material
                </li>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    Quick Revision Sheets
                </li>

                <li>
                    <i class="fa-solid fa-circle-check"></i>
                    Important Questions & Short Notes
                </li>

            </ul>

        </div>

        <div class="premium-pyq-right">

            <button
                class="btn btn-primary premium-upgrade-btn"
                onclick="navigateTo('mentorship-view')">

                <i class="fa-solid fa-crown"></i>

                Become Elite Member

            </button>

        </div>
    </div>
    `;
}
  container.innerHTML += premiumBanner;
}
// Click outside modal to close
document
.getElementById("pdf-preview-modal")
.addEventListener("click", function(event){

    if(event.target === this){

        closePdfPreview();

    }

});
// Escape key
document.addEventListener("keydown", function(event){

    if(event.key === "Escape"){

        const modal = document.getElementById("pdf-preview-modal");

        if(modal && modal.classList.contains("open")){

            closePdfPreview();

        }

    }

});
/*==========================================================
                CONTACT FORM (FORMSPREE)
==========================================================*/

async function sendContactMessage(event) {
    event.preventDefault();

    const form = event.target;
    const button = form.querySelector("button[type='submit']");

    button.disabled = true;
    button.innerHTML = "Sending...";

    try {

        const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: {
                "Accept": "application/json"
            }
        });

        if (response.ok) {

            form.reset();

            showToast("✅ Message sent successfully!", "success");

        } else {

            showToast("❌ Unable to send message.", "error");

        }

    } catch (error) {

        console.error(error);

        showToast("❌ Unable to send message.", "error");

    }

    button.disabled = false;
    button.innerHTML = "Send Message";
}
window.addEventListener("popstate", (event) => {

    if (event.state && event.state.view) {

        navigateTo(event.state.view, false);

    }

});
/*==========================================================
                    END OF FILE
==========================================================*/
