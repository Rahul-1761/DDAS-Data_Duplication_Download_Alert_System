# 📦 DDAS - Data Download Duplication Alert System

## 🧠 Description

In data-driven environments like research labs, academic institutions, or government agencies, unintentional duplication of downloaded datasets is a common yet overlooked problem. This not only wastes storage and bandwidth but also complicates collaboration and data traceability.

The **Data Download Duplication Alert System (DDAS)** is a smart backend solution designed to tackle this issue by detecting and alerting users about potential duplicate downloads in real time. By leveraging metadata such as file names, sizes, timestamps, and locations, DDAS intelligently checks whether a dataset has already been downloaded—regardless of filename changes or user origin.

When a duplicate is detected, users are prompted with contextual alerts, empowering them to make informed decisions and avoid redundancy. This ensures streamlined resource usage, promotes collaboration, and brings transparency to shared data environments.

Whether in universities, research centers, or enterprise data teams, DDAS enhances data efficiency, optimizes infrastructure usage, and reduces operational clutter—making data management smarter, leaner, and more collaborative.

---

## 🛠️ Technologies Used

- Backend: **Node.js**, **Express.js**, **MongoDB**, **Mongoose**
- Frontend: **HTML**, **CSS**, **JavaScript**
- Auth: **Express Session**
- Email Service: **Nodemailer** (SMTP with Gmail App Password)
- Password Hashing: **bcrypt.js**

---

## 📁 Project Structure

```
config
└── config.js
controllers
├── adminController.js
└── userController.js
middleware
├── adminAuth.js
└── auth.js
models
├── Download.js
├── fileModel.js
└── userModel.js
public
├── uploadedFiles
└── userImages
routes
├── adminRoute.js
└── userRoute.js
views
├── admin
│   ├── 404.ejs
│   ├── dashboard.ejs
│   ├── edit-user.ejs
│   ├── forget-password.ejs
│   ├── forget.ejs
│   ├── home.ejs
│   ├── login.ejs
│   └── new-user.ejs
├── layouts
│   ├── footer.ejs
│   └── header.ejs
└── users
    ├── 404.ejs
    ├── edit.ejs
    ├── email-verified.ejs
    ├── forget-password.ejs
    ├── forget.ejs
    ├── home.ejs
    ├── login.ejs
    ├── registration.ejs
    └── verification.ejs
.env
.gitignore
index.js
package-lock.json
package.json
README.md
```

---

## ⚙️ Configuration

### 1. `.env` File

Create a `.env` file in the root directory:

```
USER="your-email@gmail.com"
PASS="your-app-password"
```

### 2. `config/config.js`

```
const SESSIONSECRET = "MySiteSessionSecret";

module.exports = {
  SESSIONSECRET,
};
```

---

## 📦 Installation & Setup

### 🧾 Clone the repo

```bash
git clone <your-repo-url>
cd ddas
```

### 📦 Install dependencies

```bash
npm install
```

### 📁 Create required folders

```bash
mkdir -p config/config.js
mkdir -p public/uploadedFiles public/userImages
```

### ▶️ Start the server

```bash
nodemon index.js
```

---

## ✅ Future Improvements

### 1. Integration with JWT for better frontend/backend session handling

### 2. Improved UI for user interaction

### 3. Searchable metadata system for datasets

### 4. Support for external data repositories (like S3, FTP)

### 5. Support for extension for the external Data Download Duplication Alert.

---

## 👤 Author

### Rahul Kumar.

For any suggestions, contributions, or bugs, feel free to open an issue or contact me.
