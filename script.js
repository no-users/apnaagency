// Firebase Logout Script (Moved here for clarity)
const firebaseConfig = {
    apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk",
    authDomain: "my-login-page-62659.firebaseapp.com",
    projectId: "my-login-page-62659",
    storageBucket: "my-login-page-62659.appspot.com",
    messagingSenderId: "265063991992",
    appId: "1:265063991992:web:f1834f4664e5494779024d"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(app);

const logoutBtn = document.querySelector('.action-btn .action-icon[data-action="logout"]');
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        auth.signOut()
            .then(() => {
                alert("Logged out successfully!");
                window.location.href = "login.html"; // Redirect to login page
            })
            .catch((error) => {
                alert("Error logging out: " + error.message);
            });
    });
}


// Banner Slider Script
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector('.slider-container');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const totalSlides = slides.length;

    const updateSlider = () => {
        const offset = -currentSlide * 100;
        slider.style.transform = `translateX(${offset}%)`;

        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentSlide].classList.add('active');
    };

    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
    };

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const slideIndex = parseInt(e.target.dataset.slide) - 1;
            currentSlide = slideIndex;
            updateSlider();
        });
    });

    // Auto-advance the slider every 5 seconds
    setInterval(nextSlide, 5000);
});
