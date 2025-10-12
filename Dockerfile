# Etapa 1: Build do Angular
FROM node:16.15.0 AS angular
WORKDIR /app

# Copia os arquivos de dependência primeiro (melhor cache)
COPY package*.json ./

# Instala dependências
RUN npm install --force

# Copia o restante do projeto
COPY . .

# Gera o build de produção
RUN npm run build --prod

# Etapa 2: Servir o Angular com Nginx
FROM nginx:alpine

# Remove a configuração padrão
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copia o build do Angular para o diretório público do Nginx
COPY --from=angular /app/dist/rcc-evento-app2 /usr/share/nginx/html

# Copia a configuração customizada do Nginx
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta padrão do Nginx
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
