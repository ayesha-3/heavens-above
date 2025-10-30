# Use official Node.js LTS image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install production dependencies only
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Create final production image
FROM base AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "run.js"]
```

---

##  Step 3: Create .dockerignore

Create `.dockerignore`:
```
node_modules
npm-debug.log
coverage
.git
.github
.gitignore
README.md
.env
.env.local
test-reports
docs
*.md
.vscode
.idea
```

---

##  Step 4: Create Heroku Configuration

Create `Procfile` for Heroku:
```
web: node run.js
