# Environment Variables Setup Guide

## Step-by-Step Instructions

### Step 1: Create the .env File

In the root directory of your project, create a new file named `.env`

**Windows:**
```bash
# Using Command Prompt
type nul > .env

# Using PowerShell
New-Item -Path .env -ItemType File
```

**macOS/Linux:**
```bash
touch .env
```

### Step 2: Copy Template

You can copy from `.env.example` if it exists, or create the file manually with the content below.

### Step 3: Add Required Variables

Open the `.env` file in a text editor and add the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/odins-eye

# CORS Configuration (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006

# Admin Default Credentials (change after first login)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Step 4: Configure Each Variable

#### PORT
- **Default:** `3000`
- **Description:** Port number for the server
- **Example:** `PORT=3000`

#### NODE_ENV
- **Development:** `development`
- **Production:** `production`
- **Description:** Environment mode
- **Example:** `NODE_ENV=development`

#### JWT_SECRET
- **Required:** Yes
- **Description:** Secret key for JWT token signing
- **How to generate:**
  ```bash
  # Using Node.js
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # Or use an online generator
  # https://randomkeygen.com/
  ```
- **Example:** `JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

#### MONGODB_URI

**Option A: Local MongoDB**
```env
MONGODB_URI=mongodb://localhost:27017/odins-eye
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with `odins-eye` (or your preferred database name)

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/odins-eye?retryWrites=true&w=majority
```

**Option C: MongoDB with Authentication (Local)**
```env
MONGODB_URI=mongodb://username:password@localhost:27017/odins-eye?authSource=admin
```

#### ALLOWED_ORIGINS
- **Description:** Comma-separated list of allowed CORS origins
- **Development:** `http://localhost:3000,http://localhost:19006`
- **Production:** Your actual domain(s)
- **Example:** `ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com`

#### ADMIN_USERNAME
- **Default:** `admin`
- **Description:** Default admin username (created by seed script)
- **Example:** `ADMIN_USERNAME=admin`

#### ADMIN_PASSWORD
- **Default:** `admin123`
- **Description:** Default admin password (created by seed script)
- **⚠️ IMPORTANT:** Change this in production!
- **Example:** `ADMIN_PASSWORD=your-strong-password-here`

### Step 5: Complete .env File Example

**For Development:**
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production-12345
MONGODB_URI=mongodb://localhost:27017/odins-eye
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**For Production:**
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=super-secure-random-string-min-32-characters-long
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/odins-eye?retryWrites=true&w=majority
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=very-strong-password-here-123!@#
```

### Step 6: Verify Setup

1. **Check file exists:**
   ```bash
   # Windows
   dir .env
   
   # macOS/Linux
   ls -la .env
   ```

2. **Verify variables are loaded:**
   ```bash
   node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing')"
   ```

3. **Start server to test:**
   ```bash
   npm start
   ```

### Step 7: Security Checklist

- [ ] `.env` file is in `.gitignore` (should not be committed to Git)
- [ ] `JWT_SECRET` is a strong random string (32+ characters)
- [ ] `ADMIN_PASSWORD` is changed from default
- [ ] `MONGODB_URI` contains correct credentials
- [ ] `ALLOWED_ORIGINS` only includes trusted domains
- [ ] `NODE_ENV=production` for production deployment

### Common Issues

#### Issue: "MongoDB connection failed"
**Solution:** 
- Check MongoDB is running (local) or connection string is correct (Atlas)
- Verify network access for MongoDB Atlas
- Check firewall settings

#### Issue: "JWT_SECRET is not defined"
**Solution:**
- Make sure `.env` file exists in root directory
- Verify `JWT_SECRET` is set in `.env`
- Restart the server after adding variables

#### Issue: "CORS error"
**Solution:**
- Add your frontend URL to `ALLOWED_ORIGINS`
- Use comma-separated list for multiple origins
- Restart server after changes

### Quick Reference

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| PORT | No | 3000 | 3000 |
| NODE_ENV | No | development | production |
| JWT_SECRET | Yes | - | random-32-char-string |
| MONGODB_URI | Yes | - | mongodb://localhost:27017/odins-eye |
| ALLOWED_ORIGINS | No | * | http://localhost:3000 |
| ADMIN_USERNAME | No | admin | admin |
| ADMIN_PASSWORD | No | admin123 | strong-password |

### Next Steps

After setting up `.env`:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Seed the database:**
   ```bash
   npm run seed
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Test the setup:**
   - Visit `http://localhost:3000/health`
   - Should return: `{"success":true,"message":"Server is running"}`


