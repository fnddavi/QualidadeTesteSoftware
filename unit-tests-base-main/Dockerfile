# Dockerfile para aplicação Node.js usando pnpm
FROM node:20-alpine

# Instala pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instala as dependências
RUN pnpm install --frozen-lockfile

# Copia o restante da aplicação
COPY . .

# Porta padrão
EXPOSE 3000

# Comando padrão
CMD ["pnpm", "dev"]
