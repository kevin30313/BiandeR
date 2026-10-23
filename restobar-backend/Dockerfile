# 1. Imagen base
FROM node:20-alpine

# 2. Establecer el directorio de trabajo
WORKDIR /app

# 3. Copiar manifestos de dependencias y configuracion de TypeScript
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

# 4. Instalar dependencias
RUN npm install

# 5. Copiar codigo fuente
COPY . .

# 6. Generar cliente de Prisma
RUN npx prisma generate

# 7. Compilar TypeScript
RUN npm run build

# 8. Puerto del contenedor
EXPOSE 4000

# 9. Comando de inicio
CMD ["npm", "start"]