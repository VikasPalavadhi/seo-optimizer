# Deployment Guide — SEO Schema Genius

Production URL: **https://seo.xopenai.in**
Server: **Digital Ocean** — `64.227.187.111`
GitHub Repo: **VikasPalavadhi/seo-optimizer**

---

## How It Works (Current Setup)

Every time you push code to the `main` branch on GitHub, deployment happens **automatically**. You don't need to do anything manually.

Here's what happens behind the scenes:

1. You push code → GitHub notices the push to `main`
2. GitHub reads `.github/workflows/deploy.yml` (the deployment recipe)
3. GitHub spins up a temporary machine and SSHes into the Digital Ocean server using a stored private key (`DEPLOY_SSH_KEY` secret)
4. On the server it runs:
   - `git pull` — downloads your latest code
   - `npm install` — installs dependencies
   - `npm run build` — compiles React into plain HTML/JS/CSS
   - `cp dist/*` — copies built files to the web folder `/var/www/seo-schema-generator/`
   - `pm2 restart` — restarts the backend API
5. Done — site is live, usually within 30 seconds

### How GitHub Has Access to the Server

This was a one-time setup:
- A key pair (private + public) was generated
- The **public key** (lock) was placed on the server at `~/.ssh/authorized_keys`
- The **private key** (key) was stored in GitHub under **Repository Settings → Secrets → `DEPLOY_SSH_KEY`**

GitHub uses that private key to log into the server on every deploy. Your personal Mac key (`id_ed25519_digitalocean`) is a separate key and currently does not have access to the server.

### Checking Deployment Status

Run this from your Mac (inside the project folder):

```bash
gh run list --limit 5
```

Or go to: `https://github.com/VikasPalavadhi/seo-optimizer/actions`

---

## If Automatic Deployment Fails

### Step 1 — Check what went wrong

```bash
gh run list --limit 5
```

If the latest run shows `failed`, get the details:

```bash
gh run view <run-id>
```

Common reasons for failure:
- Server was restarted and PM2 process name changed
- `npm install` or `npm run build` threw an error
- Server ran out of disk space
- GitHub secret (`DEPLOY_SSH_KEY`) expired or was removed

---

### Step 2 — Fix GitHub Actions issues

If the workflow file itself needs updating, edit `.github/workflows/deploy.yml` and push again — that will trigger a fresh deploy.

---

### Step 3 — Manual deployment (if GitHub Actions is completely broken)

To deploy manually, you need SSH access to the server. Currently your Mac key does not have access. To regain access, see the section below first.

Once you have SSH access, run these commands:

```bash
# 1. SSH into the server
ssh root@64.227.187.111

# 2. Go to the project folder
cd /root/seo-schema-generator

# 3. Load Node (via NVM)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 4. Pull latest code
git pull origin main

# 5. Install dependencies
npm install

# 6. Build the frontend
npm run build

# 7. Copy built files to web directory
sudo cp -r dist/* /var/www/seo-schema-generator/
sudo chown -R www-data:www-data /var/www/seo-schema-generator

# 8. Restart the backend
pm2 restart seo-schema-generator-api

# 9. Verify backend is running
pm2 list
pm2 logs seo-schema-generator-api --lines 20
```

---

## Restoring Your Mac's SSH Access to the Server

If you need to SSH into the server directly from your Mac (for manual deployments or debugging), follow these steps:

### Option A — Add your existing Mac key to the server

Your Mac already has a key at `~/.ssh/id_ed25519_digitalocean`. You need to add its public key to the server's authorized list.

1. Get someone with current server access (e.g. via GitHub Actions or another authorized person) to run this on the server:

```bash
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
```

2. To get your public key, run this on your Mac:

```bash
cat ~/.ssh/id_ed25519_digitalocean.pub
```

Copy the output and paste it in step 1.

3. Test access:

```bash
ssh -i ~/.ssh/id_ed25519_digitalocean root@64.227.187.111
```

### Option B — Generate a new key pair

```bash
# On your Mac
ssh-keygen -t ed25519 -f ~/.ssh/digitalocean_new -C "your-email@example.com"

# View the public key
cat ~/.ssh/digitalocean_new.pub
```

Then add that public key to the server's `~/.ssh/authorized_keys` as in Option A.

---

## Server Details

| Item | Value |
|------|-------|
| Server IP | `64.227.187.111` |
| SSH User | `root` |
| Project folder | `/root/seo-schema-generator` |
| Web files folder | `/var/www/seo-schema-generator/` |
| Backend port | `3007` |
| Process manager | PM2 (`seo-schema-generator-api`) |
| Web server | Nginx |
| Frontend URL | https://seo.xopenai.in |

### Useful server commands (once SSHed in)

```bash
pm2 list                                        # Check if backend is running
pm2 logs seo-schema-generator-api --lines 50    # View backend logs
pm2 restart seo-schema-generator-api            # Restart backend
sudo systemctl status nginx                     # Check if Nginx is running
sudo systemctl reload nginx                     # Reload Nginx config
df -h                                           # Check disk space
```
