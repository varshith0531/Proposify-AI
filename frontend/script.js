const BACKEND_URL = "https://proposify-ai-backend-6vse.onrender.com"; 
async function generateAIProposal() {
    const projectDetails = document.getElementById("projectDetails").value;
    const proposalText = document.getElementById("proposalText");
    const sendEmailButton = document.getElementById("sendEmail");
    const downloadButton = document.getElementById("downloadPDF");

    if (!projectDetails) {
        alert("Please enter project details.");
        return;
    }

    proposalText.innerHTML = "⏳ Generating proposal... Please wait.";
    sendEmailButton.style.display = "none";

    try {
        const response = await fetch(`${BACKEND_URL}/generate-proposal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectDetails }),
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (data.proposal) {
            proposalText.innerHTML = `<strong>Generated Proposal:</strong><pre>${data.proposal}</pre>`;

            sendEmailButton.style.display = "block";
            sendEmailButton.setAttribute("data-proposal", data.proposal);

            showDownloadButton(data.proposal);
        } else {
            proposalText.innerHTML = "❌ Failed to generate proposal. Please try again.";
        }
    } catch (error) {
        console.error("Error:", error);
        proposalText.innerHTML = "❌ Error generating proposal. Please try again.";
    }
}

async function sendProposalEmail() {
    const email = document.getElementById("email").value;
    const proposalText = document.getElementById("proposalText").querySelector("pre")?.textContent;

    if (!email) {
        alert("Please enter your email to send the PDF.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/send-pdf`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ proposalText, email }),
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("Error:", error);
        alert("Error sending email.");
    }
}

function showDownloadButton(proposalText) {
    let downloadBtn = document.getElementById("downloadPDF");

    if (!downloadBtn) {
        downloadBtn = document.createElement("button");
        downloadBtn.innerText = "Download PDF";
        downloadBtn.id = "downloadPDF";
        downloadBtn.addEventListener("click", () => DownloadPDF(proposalText));

        document.querySelector(".proposal-output").appendChild(downloadBtn);
    }
}
async function DownloadPDF() {
    try {
        const response = await fetch(`${BACKEND_URL}/download-pdf`, {
            method: "GET",
            headers: {
                "Content-Type": "application/pdf"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch PDF");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "Proposal.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading PDF:", error);
        alert("❌ Error downloading PDF. Please try again.");
    }
}


document.getElementById("generateProposal").addEventListener("click", generateAIProposal);
document.getElementById("sendEmail").addEventListener("click", sendProposalEmail);
document.getElementById("downloadPDF").addEventListener("click", DownloadPDF);
