FROM node:20

# Install system dependencies needed for git and general utilities
RUN apt-get update && apt-get install --no-install-recommends -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy lockfile and package.json first for caching
COPY package.json package-lock.json ./

# Install dependencies strictly using the lockfile (approved by AfterQuery rules)
RUN npm ci

# Copy the rest of the repository code (including .git, which is required)
COPY . .


