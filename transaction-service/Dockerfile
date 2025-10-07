FROM node:18

WORKDIR /app

# Configurar certificados SSL y variables de entorno
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Copiar archivos de dependencias primero para aprovechar cache de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Generar cliente Prisma después de copiar todo
RUN npx prisma generate

# Exponer puerto
EXPOSE 4000

# Comando de inicio (usar ts-node para development)
CMD ["npm", "run", "start:dev"]