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

    // Reset normal QR preview
    const qrContainer = document.getElementById("qrcode");
    const downloadBtn = document.getElementById("downloadBtn");
    const card = document.getElementById("card");

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

    downloadBtn.style.display = "none";

    // Hide UPI card
    card.style.display = "none";

    // Reset QR card
    const qrCard = document.getElementById("qr");

    if (qrCard) {
        qrCard.innerHTML = "";
    }
}


// WiFi password visibility
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


// Generate QR
async function generateQR(type) {

    let qrData = "";


    /*
    ==========================================
    URL
    ==========================================
    */

    if (type === "url") {

        let url = document.getElementById("urlInput").value.trim();
        const error = document.getElementById("urlError");
        const input = document.getElementById("urlInput");

        if (!url) {

            error.style.display = "none";
            input.classList.remove("invalid");

            return;
        }


        // Add http:// when protocol is not provided
        if (!/^https?:\/\//i.test(url)) {

            url = "http://" + url;

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


            // Local addresses
            const isLocalhost =
                host === "localhost" ||
                host === "127.0.0.1";


            // Check IPv4 range
            let validIP = false;

            if (ipRegex.test(host)) {

                const parts = host.split(".").map(Number);

                validIP = parts.every(
                    part => part >= 0 && part <= 255
                );

            }


            if (
                domainRegex.test(host) ||
                validIP ||
                isLocalhost
            ) {

                error.style.display = "none";
                input.classList.remove("invalid");


                /*
                Google search URL
                */

                const q = parsed.searchParams.get("q");


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

            document.getElementById("downloadBtn").style.display = "none";

            return;
        }
    }


    /*
    ==========================================
    TEXT
    ==========================================
    */

    else if (type === "text") {

        qrData =
            document.getElementById("textInput").value.trim();

        if (!qrData) {

            alert("Enter some text");

            return;
        }
    }


    /*
    ==========================================
    PHONE
    ==========================================
    */

    else if (type === "phone") {

        const name =
            document.getElementById("phoneName").value.trim();

        const number =
            document.getElementById("phoneNumber").value.trim();


        if (!number) {

            alert("Enter mobile number");

            return;
        }


        qrData =
            `Name:${name}\nPhone:${number}`;
    }


    /*
    ==========================================
    EMAIL
    ==========================================
    */

    else if (type === "email") {

        const email =
            document.getElementById("emailInput").value.trim();


        if (!email) {

            alert("Enter email address");

            return;
        }


        qrData = email;
    }


    /*
    ==========================================
    CONTACT
    ==========================================
    */

    else if (type === "contact") {

        const name =
            document.getElementById("contactName").value.trim();

        const phone =
            document.getElementById("contactPhone").value.trim();

        const email =
            document.getElementById("contactEmail").value.trim();


        if (!name && !phone && !email) {

            alert("Enter contact information");

            return;
        }


        qrData =
            `Name:${name}\nPhone:${phone}\nEmail:${email}`;
    }


    /*
    ==========================================
    UPI
    ==========================================
    */

    else if (type === "upi") {

        const name =
            document.getElementById("upiName").value.trim() ||
            "MERCHANT NAME";

        const upi =
            document.getElementById("upiId").value.trim() ||
            "merchant@upi";

        const amount =
            document.getElementById("upiAmount").value.trim();


        /*
        UPI ID validation
        */

        if (
            !upi.includes("@") ||
            upi.startsWith("@") ||
            upi.endsWith("@")
        ) {

            alert("Enter a valid UPI ID");

            return;
        }


        /*
        Create UPI payment URL
        */

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


        /*
        Hide normal QR preview
        */

        document.getElementById("qrcode").style.display =
            "none";


        /*
        Show UPI card
        */

        document.getElementById("card").style.display =
            "flex";


        /*
        Card information
        */

        document.getElementById("cardName").innerText =
            name.toUpperCase();

        document.getElementById("cardUpi").innerText =
            upi;


        /*
        Clear previous QR
        */

        document.getElementById("qr").innerHTML =
            "";


        /*
        Generate UPI QR
        */

        const qrCode =
            new QRCodeStyling({

                width: 300,

                height: 300,

                data: link,

                image: "images/upi.png",

                imageOptions: {

                    crossOrigin: "anonymous",

                    margin: 4,

                    imageSize: 0.22

                },

                dotsOptions: {

                    color: "#000",

                    type: "square"

                },

                backgroundOptions: {

                    color: "#fff"

                }

            });


        qrCode.append(
            document.getElementById("qr")
        );


        /*
        Show download button
        */

        document.getElementById("downloadBtn").style.display =
            "inline-block";


        return;
    }

    /*
    ==========================================
    WHATSAPP
    ==========================================
    */

    else if (type === "whatsapp") {

        const name =
            document.getElementById("whatsappName").value.trim();

        let number =
            document.getElementById("whatsappNumber").value.trim();

        const message =
            document.getElementById("whatsappMessage").value.trim();


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


        /*
        Remove common formatting characters
        */

        number = number.replace(/[\s\-().+]/g, "");


        /*
        Validate international phone number
        */

        if (!/^\d{8,15}$/.test(number)) {

            alert(
                "Enter a valid WhatsApp number with country code"
            );

            return;
        }


        /*
        Create WhatsApp URL

        The message will be pre-filled when
        WhatsApp opens.
        */

        const whatsappURL =
            `https://wa.me/${number}?text=${encodeURIComponent(message)}`;


        /*
        Hide UPI card
        */

        document.getElementById("card").style.display =
            "none";


        /*
        Show normal QR preview
        */

        document.getElementById("qrcode").style.display =
            "flex";


        /*
        Clear previous QR
        */

        document.getElementById("qrcode").innerHTML =
            "";


        /*
        Generate QR
        */

        const qrCode =
            new QRCodeStyling({

                width: 300,

                height: 300,

                type: "canvas",

                data: whatsappURL,



                imageOptions: {

                    crossOrigin: "anonymous",

                    margin: 5,

                    imageSize: 0.25

                },

                dotsOptions: {

                    color: "#000000",

                    type: "square"

                },

                backgroundOptions: {

                    color: "#ffffff"

                }

            });


        /*
        Temporary container
        */

        const tempDiv =
            document.createElement("div");


        qrCode.append(tempDiv);


        /*
        Wait for QR canvas
        */

        let qrCanvas = null;

        let tries = 0;


        while (!qrCanvas && tries < 40) {

            await new Promise(
                resolve => setTimeout(resolve, 50)
            );

            qrCanvas =
                tempDiv.querySelector("canvas");

            tries++;

        }


        if (!qrCanvas) {

            alert("QR could not be generated.");

            return;
        }


        /*
        Add padding
        */

        const padding = 20;


        const canvas =
            document.createElement("canvas");


        canvas.width =
            qrCanvas.width + padding * 2;

        canvas.height =
            qrCanvas.height + padding * 2;


        /*
        Canvas
        */

        const ctx =
            canvas.getContext("2d");


        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        /*
        Draw QR
        */

        ctx.drawImage(
            qrCanvas,
            padding,
            padding
        );


        /*
        Border
        */

        ctx.strokeStyle = "#000000";

        ctx.lineWidth = 4;

        ctx.strokeRect(
            2,
            2,
            canvas.width - 4,
            canvas.height - 4
        );


        /*
        Add QR to preview
        */

        document
            .getElementById("qrcode")
            .appendChild(canvas);


        /*
        Show download button
        */

        document.getElementById("downloadBtn").style.display =
            "inline-block";


        return;
    }


    /*
    ==========================================
    WIFI
    ==========================================
    */

    else if (type === "wifi") {

        const ssid =
            document.getElementById("wifiSSID").value.trim();

        const password =
            document.getElementById("wifiPassword").value.trim();

        const security =
            document.getElementById("wifiSecurity").value;

        const hidden =
            document.getElementById("wifiHidden").checked
                ? "true"
                : "false";


        if (!ssid) {

            alert("Enter WiFi name");

            return;
        }


        /*
        WiFi without password
        */

        if (security === "nopass") {

            qrData =
                `WIFI:S:${ssid};T:nopass;H:${hidden};;`;

        }


        /*
        WiFi with password
        */

        else {

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


    /*
    ==========================================
    NORMAL QR GENERATION
    ==========================================
    */


    document.getElementById("qrcode").innerHTML = "";


    const qrCode =
        new QRCodeStyling({

            width: 300,

            height: 300,

            type: "canvas",

            data: qrData,

            image: "images/QIFY_LOGO_BLACK.png",

            imageOptions: {

                crossOrigin: "anonymous",

                margin: 5,

                imageSize: 0.25

            },

            dotsOptions: {

                color: "#000000",

                type: "square"

            },

            backgroundOptions: {

                color: "#ffffff"

            }

        });


    /*
    Temporary container
    */

    const tempDiv =
        document.createElement("div");


    qrCode.append(tempDiv);


    /*
    Wait for canvas
    */

    let qrCanvas = null;

    let tries = 0;


    while (!qrCanvas && tries < 40) {

        await new Promise(
            resolve => setTimeout(resolve, 50)
        );

        qrCanvas =
            tempDiv.querySelector("canvas");

        tries++;

    }


    if (!qrCanvas) {

        alert("QR could not be generated.");

        return;
    }


    /*
    Add padding
    */

    const padding = 20;


    const canvas =
        document.createElement("canvas");


    canvas.width =
        qrCanvas.width + padding * 2;

    canvas.height =
        qrCanvas.height + padding * 2;


    /*
    Canvas context
    */

    const ctx =
        canvas.getContext("2d");


    /*
    White background
    */

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
    Draw QR
    */

    ctx.drawImage(
        qrCanvas,
        padding,
        padding
    );


    /*
    Border
    */

    ctx.strokeStyle = "#000000";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        2,
        2,
        canvas.width - 4,
        canvas.height - 4
    );


    /*
    Add canvas to page
    */

    document
        .getElementById("qrcode")
        .appendChild(canvas);


    /*
    Show download button
    */

    document.getElementById("downloadBtn").style.display =
        "inline-block";
}


/*
==========================================
DOWNLOAD QR
==========================================
*/

async function downloadQR() {

    const btn =
        document.getElementById("downloadBtn");


    btn.disabled = true;

    btn.innerText =
        "Downloading...";


    const card =
        document.getElementById("card");


    /*
    ==========================================
    UPI CARD DOWNLOAD
    ==========================================
    */

    if (card.style.display !== "none") {

        try {

            await new Promise(
                resolve => setTimeout(resolve, 500)
            );


            const canvas =
                await html2canvas(card, {

                    scale: 4,

                    useCORS: true,

                    backgroundColor: null

                });


            const link =
                document.createElement("a");


            link.download =
                "UPI_QR.png";


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

        btn.innerText =
            "Download QR";

        return;
    }


    /*
    ==========================================
    NORMAL QR DOWNLOAD
    ==========================================
    */

    const qrCanvas =
        document.querySelector("#qrcode canvas");


    if (!qrCanvas) {

        btn.disabled = false;

        btn.innerText =
            "Download QR";

        return;
    }


    try {

        const link =
            document.createElement("a");


        link.download =
            "QR.png";


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

    btn.innerText =
        "Download QR";
}


/*
==========================================
INITIALIZE
==========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Make URL the default active tab
        showForm("url");

        // Set WiFi password visibility
        togglePasswordField();

    }
);