// Get all sidebar links and sections
const sidebarLinks = document.querySelectorAll(".sidebar-nav a");
const contentSections = document.querySelectorAll(".content-section");

// Function to switch sections
function switchSection(event) {
    event.preventDefault(); // Prevent default link behavior

    // Remove active class from all links and sections
    sidebarLinks.forEach((link) => link.classList.remove("active"));
    contentSections.forEach((section) => section.classList.remove("active"));

    // Add active class to the clicked link
    this.classList.add("active");

    // Show the corresponding section
    const targetSectionId = this.getAttribute("href");
    const targetSection = document.querySelector(targetSectionId);
    targetSection.classList.add("active");
}

// Add click event listeners to sidebar links
sidebarLinks.forEach((link) => {
    link.addEventListener("click", switchSection);
});

//=================== Profile Modal ===================
// Get profile modal and profile button elements
const profileModal = document.getElementById("profileModal");
const userProfile = document.getElementById("userProfile");
const closeProfileModalBtn = profileModal.querySelector(".close-btn");

// Open Profile Modal
userProfile.addEventListener("click", () => {
    profileModal.style.display = "flex";
});

// Close Profile Modal
closeProfileModalBtn.addEventListener("click", () => {
    profileModal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (event) => {
    if (event.target === profileModal) {
        profileModal.style.display = "none";
    }
});
//=================== QR ETC Modal ===================
document.addEventListener("DOMContentLoaded", function () {
    // Get modal elements
    const modals = {
        khqr: document.getElementById("khqrModal"),
        support: document.getElementById("supportModal"),
        transfer: document.getElementById("transferModal"),
        payBills: document.getElementById("payBillsModal"),
        loan: document.getElementById("loanModal")
    };

    // Get button elements
    const buttons = {
        openKhqr: document.getElementById("openKHQR"),
        openSupport: document.getElementById("openSupport"),
        transfer: document.querySelector(".btn-transfer"),
        payBills: document.querySelector(".btn-pay"),
        loan: document.querySelector(".btn-loan")
    };

    // Get close buttons
    const closeBtns = document.querySelectorAll(".close-btn");

    // Get QR container
    const qrContainer = document.getElementById("khqr-code");

    // Function to open a modal
    function openModal(modal) {
        modal.style.display = "flex";
    }

    // Function to close all modals
    function closeModal() {
        Object.values(modals).forEach(modal => {
            modal.style.display = "none";
        });
    }

    // Function to generate KHQR code
    function generateKHQR(data) {
        qrContainer.innerHTML = ""; // Clear previous QR code
        new QRCode(qrContainer, {
            text: data, 
            width: 200, 
            height: 200
        });
    }

    // Event Listeners for opening modals
    buttons.openKhqr?.addEventListener("click", () => {
        const qrData = "https://your-bank-payment-link.com/transaction-id=12345"; // Replace with dynamic link
        generateKHQR(qrData);
        openModal(modals.khqr);
    });

    buttons.openSupport?.addEventListener("click", () => openModal(modals.support));
    buttons.transfer?.addEventListener("click", () => openModal(modals.transfer));
    buttons.payBills?.addEventListener("click", () => openModal(modals.payBills));
    buttons.loan?.addEventListener("click", () => openModal(modals.loan));

    // Event Listeners for closing modals
    closeBtns.forEach((btn) => {
        btn.addEventListener("click", closeModal);
    });

    // Close modals when clicking outside content
    window.addEventListener("click", (event) => {
        if (Object.values(modals).includes(event.target)) {
            closeModal();
        }
    });
});


// Handle Support Form Submission
supportForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        supportForm.reset(); // Reset form fields
        successMessage.style.display = "block"; // Show success message
        setTimeout(() => {
            supportModal.style.display = "none"; // Close modal after 2 seconds
            successMessage.style.display = "none"; // Hide success message
        }, 2000);
    }, 1000);
});

// Filter Transactions
document.getElementById('apply-filter').addEventListener('click', () => {
    const filterType = document.getElementById('filter-type').value;
    const filterStatus = document.getElementById('filter-status').value;
    const transactionItems = document.querySelectorAll('.transaction-item');

    transactionItems.forEach(item => {
        const type = item.getAttribute('data-type');
        const status = item.getAttribute('data-status');

        const typeMatch = filterType === 'all' || type === filterType;
        const statusMatch = filterStatus === 'all' || status === filterStatus;

        if (typeMatch && statusMatch) {
            item.style.display = 'flex'; // Show the transaction
        } else {
            item.style.display = 'none'; // Hide the transaction
        }
    });
});

//=========================== Delete All Transactions =========================
document.getElementById('delete-all').addEventListener('click', async () => {
    const confirmed = confirm('Are you sure you want to delete all transactions?');
    if (confirmed) {
        try {
            const response = await fetch('/transactions/delete-all', {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('All transactions deleted successfully!');
                window.location.reload(); // Refresh the page to reflect changes
            } else {
                alert('Failed to delete transactions.');
            }
        } catch (error) {
            console.error('Error deleting transactions:', error);
            alert('An error occurred while deleting transactions.');
        }
    }
});