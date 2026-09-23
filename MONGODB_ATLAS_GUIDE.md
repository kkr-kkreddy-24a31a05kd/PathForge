# MongoDB Atlas Setup & Configuration Guide for PathForge

This guide explains how to connect PathForge to a persistent **MongoDB Atlas** cloud database or any self-hosted MongoDB instance.

---

## 1. Quick Overview

PathForge features dual-mode database support:
1. **Embedded In-Memory Mode (Default Dev)**: If `MONGODB_URI` is left blank, the server automatically starts an embedded in-memory MongoDB engine (`mongodb-memory-server`) with zero setup.
2. **Persistent Cloud/Local Mode**: When `MONGODB_URI` is configured in `server/.env`, PathForge connects directly to that persistent database (e.g. MongoDB Atlas cluster).

---

## 2. Step-by-Step MongoDB Atlas Setup

### Step A: Create a Free MongoDB Atlas Account & Cluster
1. Navigate to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create an account (or sign in).
2. Create a new organization and project (e.g., `PathForge`).
3. Click **"Build a Database"** and select the **M0 Free Tier** (Shared).
4. Choose your preferred cloud provider (AWS, GCP, or Azure) and nearest region, then click **"Create Deployment"**.

### Step B: Configure Security (User & IP Access)
1. **Database Access (Credentials)**:
   - In the left sidebar, click **"Database Access"** under *Security*.
   - Click **"Add New Database User"**.
   - Choose **Password** authentication.
   - Enter a username (e.g., `pathforge_user`) and a secure password.
   - Under *Database User Privileges*, select **"Read and write to any database"** (or Atlas admin).
   - Click **"Add User"**.
2. **Network Access (IP Whitelist)**:
   - In the left sidebar, click **"Network Access"** under *Security*.
   - Click **"Add IP Address"**.
   - For development: Click **"Allow Access From Anywhere"** (`0.0.0.0/0`) or **"Add Current IP Address"**.
   - Click **"Confirm"**.

### Step C: Retrieve Your Connection String
1. Go to **"Database"** in the left sidebar under *Deployments*.
2. Click the **"Connect"** button next to your cluster.
3. Select **"Drivers"** (Node.js).
4. Copy the connection string format:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
5. Append your database name (e.g. `pathforge`) before the query parameters:
   ```text
   mongodb+srv://pathforge_user:YOUR_SECURE_PASSWORD@cluster0.xxxxx.mongodb.net/pathforge?retryWrites=true&w=majority
   ```

---

## 3. Configuring PathForge Server

1. Open `server/.env` (or copy from `server/.env.example`):
   ```env
   PORT=5000
   JWT_SECRET=your_super_strong_production_jwt_secret_key_here

   # Paste your MongoDB Atlas URI:
   MONGODB_URI=mongodb+srv://pathforge_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pathforge?retryWrites=true&w=majority

   # Set to 'false' if you do NOT want demo accounts seeded into your fresh Atlas DB
   # Set to 'true' if you want initial demo accounts & sample internships pre-loaded
   SEED_DEMO_DATA=true

   # Client origin
   CLIENT_URL=http://localhost:5173
   ```

2. Restart the backend server:
   ```powershell
   cd server
   node server.js
   ```

3. Terminal output will verify persistent connection:
   ```text
   ✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
   🚀 PathForge Server running on http://localhost:5000
   ```

---

## 4. Troubleshooting

| Symptom | Cause | Solution |
|---|---|---|
| `MongoServerSelectionError: connection timed out` | IP is not whitelisted | In Atlas, go to *Network Access* and add `0.0.0.0/0` or your current IP. |
| `MongoServerError: bad auth : authentication failed` | Incorrect username or password | Re-check username/password in *Database Access*. URL-encode special characters in password (e.g., `@` becomes `%40`). |
| `Fallback MongoDB Connected: 127.0.0.1` | External URI failed; server fell back to in-memory | Inspect terminal error log to see why Atlas connection timed out. |
