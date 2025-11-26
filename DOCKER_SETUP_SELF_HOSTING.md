# Docker Setup for Self-Hosting

Complete guide to run your multi-brand e-commerce store using Docker.

---

## 📋 Prerequisites

- [ ] Docker installed (https://www.docker.com/get-started)
- [ ] Docker Compose installed (comes with Docker Desktop)
- [ ] Domain name (optional, for production)
- [ ] Environment variables ready

---

## 🐳 Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Use Node.js 20 LTS
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build Next.js
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## ⚙️ Step 2: Configure Next.js for Standalone

Update `next.config.js` (or create it):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Optional: Optimize images
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
}

module.exports = nextConfig
```

---

## 🐙 Step 3: Create Docker Compose File

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      # Brand A (Green Theme Store)
      - NEXT_PUBLIC_SUPABASE_URL_BRAND_A=${NEXT_PUBLIC_SUPABASE_URL_BRAND_A}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=${NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A}
      - SUPABASE_SERVICE_ROLE_KEY_BRAND_A=${SUPABASE_SERVICE_ROLE_KEY_BRAND_A}
      - RESEND_API_KEY_BRAND_A=${RESEND_API_KEY_BRAND_A}
      - RESEND_FROM_EMAIL_BRAND_A=${RESEND_FROM_EMAIL_BRAND_A}
      - STRIPE_SECRET_KEY_BRAND_A=${STRIPE_SECRET_KEY_BRAND_A}
      - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A}
      - STRIPE_WEBHOOK_SECRET_BRAND_A=${STRIPE_WEBHOOK_SECRET_BRAND_A}
      
      # Brand B (Ecommerce Start)
      - NEXT_PUBLIC_SUPABASE_URL_BRAND_B=${NEXT_PUBLIC_SUPABASE_URL_BRAND_B}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_B=${NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_B}
      - SUPABASE_SERVICE_ROLE_KEY_BRAND_B=${SUPABASE_SERVICE_ROLE_KEY_BRAND_B}
      - RESEND_API_KEY_BRAND_B=${RESEND_API_KEY_BRAND_B}
      - RESEND_FROM_EMAIL_BRAND_B=${RESEND_FROM_EMAIL_BRAND_B}
      - STRIPE_SECRET_KEY_BRAND_B=${STRIPE_SECRET_KEY_BRAND_B}
      - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_B=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_B}
      - STRIPE_WEBHOOK_SECRET_BRAND_B=${STRIPE_WEBHOOK_SECRET_BRAND_B}
      
      # Default/Fallback
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - RESEND_FROM_EMAIL=${RESEND_FROM_EMAIL}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      
      # Application
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
      - NODE_ENV=production
      - BRAND_USE_DB=true
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## 📝 Step 4: Create Environment File

Create `.env.docker` (or use `.env`):

```env
# Brand A (Green Theme Store)
NEXT_PUBLIC_SUPABASE_URL_BRAND_A=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY_BRAND_A=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY_BRAND_A=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL_BRAND_A=orders@greentheme.com
STRIPE_SECRET_KEY_BRAND_A=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET_BRAND_A=whsec_xxxxxxxxxxxxx

# Brand B (Ecommerce Start)
NEXT_PUBLIC_SUPABASE_URL_BRAND_B=https://yyyyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_B=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY_BRAND_B=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY_BRAND_B=re_yyyyyyyyyyyyy
RESEND_FROM_EMAIL_BRAND_B=orders@ecommercestart.com
STRIPE_SECRET_KEY_BRAND_B=sk_test_yyyyyyyyyyyyy
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_B=pk_test_yyyyyyyyyyyyy
STRIPE_WEBHOOK_SECRET_BRAND_B=whsec_yyyyyyyyyyyyy

# Default/Fallback
NEXT_PUBLIC_SUPABASE_URL=https://default.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_default_key
RESEND_FROM_EMAIL=orders@yourplatform.com
STRIPE_SECRET_KEY=sk_test_default
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_default
STRIPE_WEBHOOK_SECRET=whsec_default

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production
BRAND_USE_DB=true
```

**Important:** Add `.env.docker` to `.gitignore`!

---

## 🚀 Step 5: Build and Run

### 5.1 Build Docker Image

```bash
docker-compose build
```

### 5.2 Start Container

```bash
docker-compose up -d
```

The `-d` flag runs in detached mode (background).

### 5.3 View Logs

```bash
docker-compose logs -f
```

Press `Ctrl+C` to exit logs.

### 5.4 Stop Container

```bash
docker-compose down
```

---

## 🔧 Step 6: Production Setup

### 6.1 Use Environment File

```bash
docker-compose --env-file .env.docker up -d
```

### 6.2 Add Reverse Proxy (Nginx)

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.3 Add SSL (Let's Encrypt)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 Step 7: Monitoring

### 7.1 Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  })
}
```

### 7.2 View Container Stats

```bash
docker stats
```

### 7.3 View Logs

```bash
# All logs
docker-compose logs

# Last 100 lines
docker-compose logs --tail=100

# Follow logs
docker-compose logs -f
```

---

## 🔄 Step 8: Updates and Maintenance

### 8.1 Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

### 8.2 Update Environment Variables

1. Edit `.env.docker`
2. Restart container:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### 8.3 Backup Database

```bash
# Export Supabase data (use Supabase dashboard or CLI)
# Or use pg_dump if self-hosting PostgreSQL
```

---

## 🚨 Troubleshooting

### Issue: Container Won't Start

**Solution:**
```bash
# Check logs
docker-compose logs

# Check if port 3000 is in use
lsof -i :3000

# Kill process on port 3000
kill -9 $(lsof -t -i:3000)
```

### Issue: Build Fails

**Solution:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Issue: Environment Variables Not Loading

**Solution:**
1. Check `.env.docker` file exists
2. Verify variable names match `docker-compose.yml`
3. Restart container after changes

### Issue: Out of Memory

**Solution:**
```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory
# Set to at least 4GB
```

---

## 📦 Step 9: Docker Hub (Optional)

### 9.1 Build and Tag Image

```bash
docker build -t yourusername/ecomm:latest .
```

### 9.2 Push to Docker Hub

```bash
docker push yourusername/ecomm:latest
```

### 9.3 Pull on Server

```bash
docker pull yourusername/ecomm:latest
docker run -d -p 3000:3000 --env-file .env.docker yourusername/ecomm:latest
```

---

## 🌐 Step 10: Deploy to Cloud

### Option A: DigitalOcean Droplet

1. Create Droplet (Ubuntu 22.04)
2. Install Docker:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```
3. Clone repository
4. Copy `.env.docker`
5. Run `docker-compose up -d`

### Option B: AWS EC2

1. Launch EC2 instance (Ubuntu)
2. Install Docker
3. Clone repository
4. Copy `.env.docker`
5. Run `docker-compose up -d`

### Option C: Any VPS

Same steps as DigitalOcean/AWS.

---

## 📋 Checklist

- [ ] Docker installed
- [ ] Dockerfile created
- [ ] `next.config.js` updated (standalone output)
- [ ] `docker-compose.yml` created
- [ ] `.env.docker` created
- [ ] Image builds successfully
- [ ] Container runs
- [ ] Application accessible on port 3000
- [ ] Environment variables loaded
- [ ] Health check endpoint works
- [ ] Reverse proxy configured (production)
- [ ] SSL certificate installed (production)

---

## 💡 Pro Tips

1. **Use .dockerignore:**
   ```
   node_modules
   .next
   .git
   .env*
   *.md
   ```

2. **Multi-stage Build:**
   - Smaller final image
   - Faster builds
   - Better caching

3. **Health Checks:**
   - Automatic restart on failure
   - Monitoring integration
   - Load balancer ready

4. **Volume Mounts (Development):**
   ```yaml
   volumes:
     - .:/app
     - /app/node_modules
   ```

5. **Resource Limits:**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 2G
   ```

---

## 📚 Resources

- **Docker Docs:** https://docs.docker.com
- **Docker Compose:** https://docs.docker.com/compose
- **Next.js Docker:** https://nextjs.org/docs/deployment#docker-image
- **Docker Hub:** https://hub.docker.com

---

**Your multi-brand store is now containerized! 🐳**

