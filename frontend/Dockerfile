# =========================
# Stage 1: Build Angular app
# =========================
FROM node:20-alpine AS build

WORKDIR /app

# Enable npm's cache and improve reproducibility
COPY package.json package-lock.json ./

RUN npm ci --no-audit --no-fund

# Copy application source
COPY . .

# Build Angular application
RUN npm run build


# =========================
# Stage 2: Nginx runtime
# =========================
FROM nginx:1.27-alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Angular production build
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Nginx listens on port 80
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]