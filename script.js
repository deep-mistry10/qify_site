/* ==========================================
   QIFY QR CODE GENERATOR
========================================== */


/* ==========================================
   SHOW FORM
========================================== */

function showForm(type) {

    // Hide all forms
    document.querySelectorAll(".form").forEach(form => {
        form.style.display = "none";
    });

    // Show selected form
    const selectedForm = document.getElementById(type + "-form");

    if (selectedForm) {
        selectedForm.style.display = "block";
    }

    // Update active tab
    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
    });

    const selectedTab = document.querySelector(
        `.tab[onclick="showForm('${type}')"]`
    );

    if (selectedTab) {
        selectedTab.classList.add("active");
    }

    // Reset QR preview
    const qrContainer = document.getElementById("qrcode");
    const downloadBtn = document.getElementById("downloadBtn");
    const card = document.getElementById("card");

    if (qrContainer) {
        qrContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-qr">
                    <span></span><span></span><span></span>
                    <span></span><span></span><span></span>
                    <span></span><span></span><span></span>
                </div>

                <strong>QR preview</strong>

                <p>Your generated QR code will appear here.</p>
            </div>
        `;

        qrContainer.style.display = "flex";
    }

    if (downloadBtn) {
        downloadBtn.style.display = "none";
    }

    // Hide UPI card
    if (card) {
        card.style.display = "none";
    }

    // Clear UPI QR
    const qrCard = document.getElementById("qr");

    if (qrCard) {
        qrCard.innerHTML = "";
    }
}


/* ==========================================
   WIFI PASSWORD FIELD
========================================== */

function togglePasswordField() {

    const security = document.getElementById("wifiSecurity");
    const passwordField = document.getElementById("wifiPassword");

    if (!security || !passwordField) {
        return;
    }

    if (security.value === "nopass") {
        passwordField.style.display = "none";
    } else {
        passwordField.style.display = "block";
    }
}


/* ==========================================
   CREATE QR CODE
========================================== */

function createQRCode(container, data, options = {}) {

    if (!container) {
        console.error("QR container not found.");
        return null;
    }

    if (typeof QRCodeStyling === "undefined") {
        console.error("QRCodeStyling library was not loaded.");
        alert("QR generator could not load. Please refresh the page.");
        return null;
    }

    // Clear previous QR
    container.innerHTML = "";

    const qrCode = new QRCodeStyling({
        width: options.width || 300,
        height: options.height || 300,

        type: "canvas",

        data: data,
        margin: options.margin || 15,

        image: options.image || undefined,

        imageOptions: {
            crossOrigin: "anonymous",
            margin: options.imageMargin || 5,
            imageSize: options.imageSize || 0.25
        },

        dotsOptions: {
            color: "#000000",
            type: "square"
        },

        backgroundOptions: {
            color: "#ffffff"
        },

        cornersSquareOptions: {
            color: "#000000",
            type: "square"
        },

        cornersDotOptions: {
            color: "#000000",
            type: "square"
        }
    });

    // IMPORTANT:
    // Append the QR library directly.
    // Do not copy its canvas into another canvas.
    qrCode.append(container);

    return qrCode;
}


/* ==========================================
   GENERATE QR
========================================== */

async function generateQR(type) {

    let qrData = "";


    /* ==========================================
       URL
    ========================================== */

    if (type === "url") {

        let url =
            document.getElementById("urlInput").value.trim();

        const error =
            document.getElementById("urlError");

        const input =
            document.getElementById("urlInput");


        if (!url) {

            if (error) {
                error.style.display = "none";
            }

            input.classList.remove("invalid");

            return;
        }


        // Add HTTP when protocol isn't supplied
        if (!/^https?:\/\//i.test(url)) {
            url = "https://" + url;
        }


        try {

            const parsed = new URL(url);

            const host = parsed.hostname;


            // Domain validation
            const domainRegex =
                /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;


            // IPv4 validation
            const ipRegex =
                /^(\d{1,3}\.){3}\d{1,3}$/;


            const isLocalhost =
                host === "localhost" ||
                host === "127.0.0.1";


            let validIP = false;


            if (ipRegex.test(host)) {

                const parts =
                    host.split(".").map(Number);

                validIP =
                    parts.every(
                        part =>
                            part >= 0 &&
                            part <= 255
                    );
            }


            if (
                domainRegex.test(host) ||
                validIP ||
                isLocalhost
            ) {

                error.style.display = "none";

                input.classList.remove("invalid");


                // Google search URL
                const q =
                    parsed.searchParams.get("q");


                if (
                    parsed.hostname.includes("google.com") &&
                    q
                ) {

                    qrData =
                        `https://www.google.com/search?q=${encodeURIComponent(q)}`;

                } else {

                    qrData = url;

                }

            } else {

                throw new Error("Invalid host");

            }


        } catch {

            error.innerText =
                "Enter a valid domain, IP address or URL";

            error.style.display = "block";

            input.classList.add("invalid");

            document.getElementById("qrcode").innerHTML = "";

            document.getElementById("downloadBtn").style.display =
                "none";

            return;
        }
    }


    /* ==========================================
       TEXT
    ========================================== */

    else if (type === "text") {

        qrData =
            document
                .getElementById("textInput")
                .value
                .trim();


        if (!qrData) {

            alert("Enter some text");

            return;
        }
    }


    /* ==========================================
       PHONE
    ========================================== */

    else if (type === "phone") {

        const name =
            document
                .getElementById("phoneName")
                .value
                .trim();

        const number =
            document
                .getElementById("phoneNumber")
                .value
                .trim();


        if (!number) {

            alert("Enter mobile number");

            return;
        }


        qrData =
            `Name:${name}\nPhone:${number}`;
    }


    /* ==========================================
       EMAIL
    ========================================== */

    else if (type === "email") {

        const email =
            document
                .getElementById("emailInput")
                .value
                .trim();


        if (!email) {

            alert("Enter email address");

            return;
        }


        qrData = email;
    }


    /* ==========================================
       CONTACT
    ========================================== */

    else if (type === "contact") {

        const name =
            document
                .getElementById("contactName")
                .value
                .trim();

        const phone =
            document
                .getElementById("contactPhone")
                .value
                .trim();

        const email =
            document
                .getElementById("contactEmail")
                .value
                .trim();


        if (!name && !phone && !email) {

            alert("Enter contact information");

            return;
        }


        qrData =
            `Name:${name}\nPhone:${phone}\nEmail:${email}`;
    }


    /* ==========================================
       WIFI
    ========================================== */

    else if (type === "wifi") {

        const ssid =
            document
                .getElementById("wifiSSID")
                .value
                .trim();

        const password =
            document
                .getElementById("wifiPassword")
                .value
                .trim();

        const security =
            document
                .getElementById("wifiSecurity")
                .value;

        const hidden =
            document
                .getElementById("wifiHidden")
                .checked
                ? "true"
                : "false";


        if (!ssid) {

            alert("Enter WiFi name");

            return;
        }


        if (security === "nopass") {

            qrData =
                `WIFI:S:${ssid};T:nopass;H:${hidden};;`;

        } else {

            if (!password) {

                alert("Enter WiFi password");

                return;
            }


            qrData =
                `WIFI:S:${ssid};` +
                `T:${security};` +
                `P:${password};` +
                `H:${hidden};;`;
        }
    }


    /* ==========================================
       WHATSAPP
    ========================================== */

    else if (type === "whatsapp") {

        const name =
            document
                .getElementById("whatsappName")
                .value
                .trim();

        let number =
            document
                .getElementById("whatsappNumber")
                .value
                .trim();

        const message =
            document
                .getElementById("whatsappMessage")
                .value
                .trim();


        if (!name) {

            alert("Enter name");

            return;
        }


        if (!number) {

            alert("Enter WhatsApp number");

            return;
        }


        if (!message) {

            alert("Enter message");

            return;
        }


        // Remove formatting characters
        number =
            number.replace(
                /[\s\-().+]/g,
                ""
            );


        if (!/^\d{8,15}$/.test(number)) {

            alert(
                "Enter a valid WhatsApp number with country code"
            );

            return;
        }


        qrData =
            `https://wa.me/${number}?text=${encodeURIComponent(message)}`;


        // Hide UPI card
        document
            .getElementById("card")
            .style.display = "none";


        // Show normal QR
        const qrContainer =
            document.getElementById("qrcode");

        qrContainer.style.display = "flex";


        // Generate directly
        createQRCode(
    qrContainer,
    qrData,
    {
        width: 300,
        height: 300,
        image: "images/whatsapp.png",
        imageMargin: 5,
        imageSize: 0.22
    }
);


        // Show download
        document
            .getElementById("downloadBtn")
            .style.display = "inline-block";


        return;
    }


    /* ==========================================
       UPI
    ========================================== */

    else if (type === "upi") {

        const name =
            document
                .getElementById("upiName")
                .value
                .trim() ||
            "MERCHANT NAME";


        const upi =
            document
                .getElementById("upiId")
                .value
                .trim();


        const amount =
            document
                .getElementById("upiAmount")
                .value
                .trim();


        if (
            !upi ||
            !upi.includes("@") ||
            upi.startsWith("@") ||
            upi.endsWith("@")
        ) {

            alert("Enter a valid UPI ID");

            return;
        }


        let link =
            `upi://pay?pa=${encodeURIComponent(upi)}` +
            `&pn=${encodeURIComponent(name)}` +
            `&cu=INR`;


        if (
            amount &&
            !isNaN(amount) &&
            Number(amount) > 0
        ) {

            link +=
                `&am=${encodeURIComponent(amount)}`;
        }


        // Hide normal QR
        document
            .getElementById("qrcode")
            .style.display = "none";


        // Show UPI card
        const card =
            document.getElementById("card");

        card.style.display = "flex";


        // Card information
        document
            .getElementById("cardName")
            .innerText =
            name.toUpperCase();


        document
            .getElementById("cardUpi")
            .innerText =
            upi;


        // Clear old UPI QR
        const qrCard =
            document.getElementById("qr");

        qrCard.innerHTML = "";


        // Create UPI QR
        createQRCode(
            qrCard,
            link,
            {
                width: 300,
                height: 300,
                image: "images/upi.png",
                imageMargin: 4,
                imageSize: 0.22
            }
        );


        // Show download
        document
            .getElementById("downloadBtn")
            .style.display = "inline-block";


        return;
    }


    /* ==========================================
       NORMAL QR
    ========================================== */

    const qrContainer =
        document.getElementById("qrcode");


    const card =
        document.getElementById("card");


    // Hide UPI card
    card.style.display = "none";


    // Show normal QR
    qrContainer.style.display = "flex";


    // Generate QR directly
    createQRCode(
        qrContainer,
        qrData,
        {
            width: 300,
            height: 300,
            image: "images/QIFY_LOGO_BLACK.png",
            imageMargin: 5,
            imageSize: 0.25
        }
    );


    // Show download button
    document
        .getElementById("downloadBtn")
        .style.display = "inline-block";
}


/* ==========================================
   DOWNLOAD QR
========================================== */

async function downloadQR() {

    const btn =
        document.getElementById("downloadBtn");


    btn.disabled = true;

    btn.innerText = "Downloading...";


    const card =
        document.getElementById("card");


    /* ==========================================
       UPI CARD
    ========================================== */

    if (card.style.display !== "none") {

        try {

            await new Promise(
                resolve =>
                    setTimeout(resolve, 500)
            );


            const canvas =
                await html2canvas(
                    card,
                    {
                        scale: 4,
                        useCORS: true,
                        backgroundColor: null
                    }
                );


            const link =
                document.createElement("a");


            link.download = "UPI_QR.png";

            link.href =
                canvas.toDataURL("image/png");


            link.click();


        } catch (error) {

            console.error(
                "UPI QR download failed:",
                error
            );

            alert(
                "Could not download the UPI QR."
            );
        }


        btn.disabled = false;

        btn.innerText = "Download QR";

        return;
    }


    /* ==========================================
       NORMAL QR DOWNLOAD
    ========================================== */

    const qrCanvas =
        document.querySelector(
            "#qrcode canvas"
        );


    if (!qrCanvas) {

        btn.disabled = false;

        btn.innerText = "Download QR";

        return;
    }


    try {

        const link =
            document.createElement("a");


        link.download = "QIFY_QR.png";


        link.href =
            qrCanvas.toDataURL("image/png");


        link.click();


    } catch (error) {

        console.error(
            "QR download failed:",
            error
        );

        alert(
            "Could not download the QR."
        );
    }


    btn.disabled = false;

    btn.innerText = "Download QR";
}


/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // URL is default
        showForm("url");

        // WiFi password visibility
        togglePasswordField();

    }
);