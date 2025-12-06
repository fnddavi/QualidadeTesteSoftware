# Dockerfile.test

FROM node:22-alpine

# Instala o pnpm globalmente
RUN npm i -g pnpm

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de gerenciamento de pacotes
COPY package*.json pnpm-lock.yaml ./

# Instala as dependências usando pnpm (equivalente ao npm ci)
RUN pnpm install --frozen-lockfile

# Copia o restante do código-fonte para o contêiner
COPY . .

# Comando padrão que será executado ao subir o contêiner
CMD ["npm", "run", "test:ci"]