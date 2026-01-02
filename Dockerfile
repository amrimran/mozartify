# Use a base image that has Node.js (Debian version to allow installing Java)
FROM node:18-bullseye

# 1. Install Java (Required for Audiveris)
RUN apt-get update && \
    apt-get install -y default-jre && \
    apt-get clean

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the application code
COPY . .

# 5. Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# 6. Expose the port (Hugging Face expects port 7860)
EXPOSE 7860

# 7. Start the server
# Note: changing port to 7860 to match HF requirements
ENV PORT=7860
CMD ["node", "server/mainserver.js"]