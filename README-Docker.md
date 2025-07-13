# Docker Setup - Scriptoryum Frontend

Este documento explica como configurar e executar o projeto Scriptoryum Frontend usando Docker.

## Pré-requisitos

- Docker instalado
- Docker Compose instalado

## Estrutura dos Arquivos Docker

- `docker-compose.yml` - Configuração principal para produção e desenvolvimento
- `Dockerfile` - Build para produção com Nginx
- `Dockerfile.dev` - Build para desenvolvimento com hot reload
- `nginx.conf` - Configuração do Nginx para produção
- `.dockerignore` - Arquivos a serem ignorados no build

## Comandos Disponíveis

### Desenvolvimento

```bash
# Executar em modo desenvolvimento com hot reload
docker-compose --profile dev up frontend-dev

# Ou usando o serviço padrão
docker-compose up frontend

# Em background
docker-compose --profile dev up -d frontend-dev
```

### Produção

```bash
# Build e execução para produção
docker-compose up --build frontend

# Em background
docker-compose up -d --build frontend
```

### Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Rebuild completo (limpar cache)
docker-compose build --no-cache

# Ver logs
docker-compose logs -f frontend

# Executar comandos dentro do container
docker-compose exec frontend sh

# Instalar novas dependências
docker-compose exec frontend npm install <package>
```

## Portas

- **Desenvolvimento**: http://localhost:5173
- **Produção**: http://localhost:3000

## Volumes

O projeto usa volumes para:
- Sincronizar código fonte (hot reload em desenvolvimento)
- Persistir node_modules para melhor performance

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto para configurar variáveis específicas:

```env
# Exemplo
VITE_API_URL=http://localhost:8000
VITE_APP_TITLE=Scriptoryum
```

## Troubleshooting

### Hot Reload não funciona
- Certifique-se de que `CHOKIDAR_USEPOLLING=true` está configurado
- No Windows, pode ser necessário usar polling

### Problemas de permissão
```bash
# Linux/Mac - ajustar permissões
sudo chown -R $USER:$USER .
```

### Container não inicia
```bash
# Verificar logs
docker-compose logs frontend

# Rebuild sem cache
docker-compose build --no-cache frontend
```

### Limpar tudo
```bash
# Remover containers, volumes e imagens
docker-compose down -v --rmi all
docker system prune -a
```