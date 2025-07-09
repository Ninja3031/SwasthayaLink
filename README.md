##Problem Statement
**Current healthcare systems** are fragmented and inefficient, making them difficult to use for both doctors and patients.
**Patients lack a unified platform** to securely access and share their medical records.
**Doctors struggle with manual tracking**, disconnected systems, and information overload.
**Existing platforms **fail to convert medical documents into structured insights, delaying diagnosis and reducing care efficiency.


##Proposed Solution
SwasthiyaLink is a unified application for patients and doctors, integrating secure medical record storage, appointment booking, and health data visualization in one platform.


**##SwasthiyaLink**

SwasthayaLink is a smart healthcare dashboard and consultation platform designed to streamline doctor-patient interactions and improve healthcare outcomes using advanced technology, PaddleOCR for document and prescription digitization, machine learning integration for predictive analytics, and ABHA ID support to securely access and unify patient health records.

## Features

- **Doctor Dashboard**: Visual analytics for total patients, appointments, revenue, and average ratings.
- **Search and Filter**: Quickly search for patient records or appointments with an intuitive interface.
- **Notifications & Messages**: Doctors receive notifications and can view messages within the platform.
- **Authentication**: Secure login and authentication mechanism for doctors.
- **AI Risk Prediction**: Integrates a machine learning regression model (via FastAPI) to help predict patient risk levels and support clinical    decision-making.
- **Modern and Responsive UI**: Built with a focus on a clean, accessible, and efficient user experience.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: MERN stack (MongoDB, Express.js, React, Node.js)
- **Machine Learning**: Python, Scikit-learn (for regression model), integrated via FastAPI

##Future Scope
-Add multilingual support to make the platform accessible to a wider population.
-Build personalized treatment recommendations using AI to suggest tailored care plans and preventive measures.
-Integrate real-time analytics and monitoring by connecting with wearable and IoT device data.
-Connect with insurance providers and pharmacies to create a complete treatment-to-fulfillment workflow.
-Strengthen privacy and compliance features to align with healthcare data standards such as HIPAA and GDPR.

##Contribution
-**Frontend Development**: Designed and implemented the complete frontend using React, TypeScript, and Tailwind CSS.
-**Machine Learning Models**: Built linear regression models to analyze and predict patient risk scores and integrated them into the system.
-**Backend Development and Integration Aadiraj** : developed the backend using Python and FastAPI, and integrated the ML model APIs with the         frontend.
-**Authentication and Secure Login Aadiraj** : implemented secure authentication logic.
-**Overall Integration and Testing:** Collaborated on merging frontend and backend, and performed end-to-end testing.

![System Architecture](https://github.com/user-attachments/assets/46e12f8d-59ba-4fdd-af62-825e1dad30fe)
![System Overview](https://github.com/user-attachments/assets/a04ace8d-dd11-45d3-bbdd-b8b79d5f80a4)

## 🚀 Getting Started & Deployment

### Local Development

1. **Setup Environment**
   ```bash
   npm run setup
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   npm install

   # Patient Frontend
   cd temp-frontend && npm install

   # Doctor Frontend
   cd Doctorside && npm install
   ```

3. **Start Services**
   ```bash
   # Backend (Terminal 1)
   npm run dev

   # Patient Portal (Terminal 2)
   cd temp-frontend && npm run dev

   # Doctor Portal (Terminal 3)
   cd Doctorside && npm run dev
   ```

### 🌐 Production Deployment

**Backend on Render + Frontends on Vercel**

1. **Backend on Render**: Create Web Service, connect GitHub, set environment variables
2. **Frontend on Vercel**: Deploy unified portal from `temp-frontend` directory

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions**








