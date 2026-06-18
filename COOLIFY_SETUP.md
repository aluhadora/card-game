# Coolify Deployment Setup Guide

This guide walks you through deploying the card-game application on Coolify with GitHub integration and automatic deployments.

## Prerequisites

- ✅ VPS with Coolify installed (http://178.104.123.22)
- ✅ GitHub account with access to aluhadora/card-game repo
- ✅ Docker Compose configured locally (verified working)

## Step 1: Access Coolify Dashboard

1. Open your browser and navigate to your Coolify instance IP
2. Log in with your credentials
3. Navigate to **Projects** or create a new project for "card-game"

## Step 2: Create a New Application

### Option A: Using Docker Compose (Recommended)

1. In Coolify, click **New Project** → **New Application**
2. Choose **Docker Compose** as the deployment method
3. Select **GitHub** as your source
4. Connect your GitHub account (Coolify will prompt for OAuth)
5. Select the repository: `aluhadora/card-game`
6. Set the branch to: `dockerize`
7. Set the root directory to: `.` (root of repo)

### Option B: If Using Direct Git Integration

1. Coolify can also pull from Git directly via SSH or HTTPS
2. Configure the repository URL: `https://github.com/aluhadora/card-game.git`
3. Branch: `dockerize`

## Step 3: Configure Environment Variables

In the Coolify dashboard, set these environment variables:

```
NODE_ENV=production
PORT=3001
```

(The docker-compose.yml already includes defaults, but you can override here)

## Step 4: Configure Ports & Networking

1. **Client Container (Nginx)**
   - Internal Port: `80`
   - Exposed Port: Choose an available port or let Coolify assign one
   - This will be your main domain entry point

2. **Server Container**
   - Internal Port: `3001`
   - DO NOT expose this to the internet
   - It will only be accessible via Docker's internal network (to Nginx)

## Step 5: Domain & SSL Configuration

1. **Add Domain**
   - Point your domain/subdomain to your VPS IP
   - Or use the temporary sslip.io domain: `http://trucpjl739sr0pfedv7m8fg8.178.104.123.22.sslip.io`

2. **Enable SSL/HTTPS** (Optional but recommended)
   - Coolify should auto-generate Let's Encrypt certificates
   - If using a real domain, enable SSL in Coolify's domain settings
   - For sslip.io testing, HTTP is fine initially

## Step 6: GitHub Webhook Integration

To enable automatic deployments when you push to the `dockerize` branch:

### In Coolify:
1. Go to your application settings
2. Look for **Webhooks** or **Git Integration** settings
3. Copy the webhook URL provided by Coolify

### In GitHub:
1. Go to `aluhadora/card-game` → **Settings** → **Webhooks**
2. Click **Add webhook**
3. Paste the webhook URL from Coolify into **Payload URL**
4. Set **Content type** to `application/json`
5. Select **Let me select individual events** and check:
   - ☑️ Push events
   - ☑️ Pull request events
6. Make sure **Active** is checked
7. Click **Add webhook**

Now whenever you push to the `dockerize` branch, Coolify will automatically:
1. Pull the latest code
2. Build the Docker images
3. Start/restart the containers
4. Update the running application

## Step 7: Deploy

1. In Coolify, click **Deploy** or **Redeploy**
2. Watch the build logs to ensure both containers start successfully
3. Once deployed, your app should be accessible at your configured domain

## Troubleshooting

### Check Logs
- **Client (Nginx)**: Look for port binding errors or config issues
- **Server (Node/Bun)**: Look for startup errors or port conflicts

### Common Issues

**Issue: "Cannot connect to server"**
- Verify the nginx.conf is routing `/api` correctly
- Check that server container is running and healthy
- Ensure `VITE_SERVER_URL` is set to `/api`

**Issue: "Socket.io connection fails"**
- The Socket.io path must be `/api/socket.io` for the proxy to work
- This is already configured in App.jsx

**Issue: "Static assets return 404"**
- Verify the client build completed successfully
- Check that `/dist` files exist in the Nginx container

### View Real-time Logs
In Coolify, each application shows live logs. Monitor these during and after deployment.

## Local Testing (Before Deploying)

To test the production setup locally:

```bash
# Build and start with production settings
docker-compose up -d

# Verify both containers are running
docker-compose ps

# Test the app
curl http://localhost
curl http://localhost/api  # Should proxy to server
```

## Next Steps

1. **Test**: Navigate to your domain and play a game to verify client-server communication
2. **Monitor**: Use Coolify's dashboard to monitor resource usage and logs
3. **Custom Domain**: Once everything works, purchase a domain and update DNS
4. **SSL Certificate**: Update Coolify to use your real domain for HTTPS
5. **Scheduled Updates**: Consider setting up automatic security updates in Coolify

## File Changes Summary

Modified/Created files for Coolify compatibility:
- ✅ `docker-compose.yml` - Updated for production environment
- ✅ `client/Dockerfile` - Added nginx.conf copy
- ✅ `client/nginx.conf` - New file for path-based routing
- ✅ `client/src/App.jsx` - Updated socket.io path configuration

All changes are backward compatible with local `docker-compose up` testing.
