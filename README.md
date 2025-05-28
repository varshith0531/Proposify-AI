# Proposify-AI

Proposify-AI is a web application that helps users create professional proposals effortlessly using AI technology. The application provides an intuitive interface for users to input project details and generate well-structured proposals, which can be downloaded as PDFs or sent via email.

## Features

- **AI-Powered Proposal Generation**: Convert project descriptions into professionally formatted proposals
- **PDF Export**: Download generated proposals as PDF documents
- **Email Integration**: Send proposals directly via email
- **Modern UI**: Beautiful and responsive user interface with dynamic background effects
- **Chat-bot Support**: Integrated chat-bot for additional assistance

## Project Structure

```
proposify-ai/
├── backend/           # Node.js/Express backend server
│   ├── server.js     # Main server file
│   └── ...
│
└── frontend/         # Frontend web application
    ├── proposify-ai.html
    ├── script.js
    ├── styles.css
    └── ...
```

## Technologies Used

### Backend
- Node.js
- Express.js
- Google Generative AI
- Nodemailer for email functionality
- PDFKit for PDF generation
- CORS for cross-origin resource sharing

### Frontend
- HTML5
- CSS3
- JavaScript
- Three.js for 3D effects
- Vanta.js for background animations

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/proposify-ai.git
cd proposify-ai
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```
# Add your environment variables here
```

5. Start the backend server:
```bash
cd backend
node server.js
```

6. Open the frontend application in your web browser:
Open `frontend/proposify-ai.html` in your preferred web browser.

## Usage

1. Navigate to the Proposify-AI page
2. Enter your project details in the text area
3. Click "Draft-Proposal" to generate a proposal
4. Review the generated proposal
5. Download the proposal as PDF or send it via email

## Team

Team Proposify-AI
