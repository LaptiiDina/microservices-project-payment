# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем всё остальное
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Указываем порт, на котором работает приложение
EXPOSE 3000

# Команда для запуска приложения
CMD ["npm", "run", "start:dev"]
