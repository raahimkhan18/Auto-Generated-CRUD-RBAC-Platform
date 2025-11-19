# Auto-Generated CRUD + RBAC Platform ⚙️🚀

A smart low-code developer tool that lets admins **create data models from a web UI**, and the system automatically generates **CRUD APIs**, **SQLite tables**, and **RBAC permissions** — all without restarting the server.

---

## 📸 Dashboard Preview


| ![dash](screenshots/dashboard.png) | ![form](screenshots/model_form.png) | ![records](screenshots/records.png) |



---

## 🚀 Features

- 🏗️ Build models visually from UI  
- ⚡ Auto-generate **Create / Read / Update / Delete** APIs  
- 🔐 Built-in **RBAC** (Admin / Manager / Viewer)  
- 🧍 Ownership-based record access  
- 🗄️ SQLite table generation  
- 🎨 Clean React + Tailwind Dashboard  
- 💾 Models saved as JSON inside `/models/`  
- 🔄 No server restart needed  

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|----------|
| **Node.js + Express (TypeScript)** | Backend API & dynamic routing |
| **SQLite (better-sqlite3)** | Fast local database |
| **React + Vite** | Admin UI |
| **Tailwind CSS** | Styling |
| **File-based storage** | Model definitions |

---

## 🧩 How It Works

1. Admin enters **model name + fields + RBAC rules**  
2. Clicks **Publish**  
3. Backend automatically:  
   - 💾 Saves `<ModelName>.json`  
   - 🗄️ Creates SQLite table  
   - ⚡ Registers CRUD API routes  
4. UI updates with new model instantly  
5. RBAC protects each API call  

---

## 🧪 Example Model JSON

```json
{
  "name": "Employee",
  "fields": [
    { "name": "name", "type": "string", "required": true },
    { "name": "age", "type": "number" },
    { "name": "isActive", "type": "boolean", "default": true }
  ],
  "ownerField": "ownerId",
  "rbac": { 
    "Admin": ["all"],
    "Manager": ["create", "read", "update"],
    "Viewer": ["read"] 
  }
}

---

## How to Run

-backend
cd backend
npm install
npm run dev

-frontend
cd frontend
npm install
npm run dev

---

## 📦 How to Run the Project

1. Clone this repository:
   ```bash
   git clone https://github.com/raahimkhan18/Auto-Generated-CRUD-RBAC-Platform.git


