#!/bin/bash
set -e

# ----------------------------------------------------------------------
# 1. Instalar e iniciar o Docker (Amazon Linux 2023)
# ----------------------------------------------------------------------
dnf install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# ----------------------------------------------------------------------
# 2. Login no ECR e pull da imagem
# ----------------------------------------------------------------------
aws ecr get-login-password --region sa-east-1 | docker login \
  --username AWS --password-stdin ${image_url}

docker pull ${image_url}:latest

# ----------------------------------------------------------------------
# 3. Subir a API apontando para o RDS
# ----------------------------------------------------------------------
docker run -d --name ticket-api --restart unless-stopped \
  -p 3000:3000 \
  -e HOST=0.0.0.0 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e "DATABASE_URL=postgresql://${db_user}:${db_password}@${db_endpoint}/${db_name}?schema=public" \
  ${image_url}:latest

# ----------------------------------------------------------------------
# 4. Registrar no CloudWatch? (opcional) - por ora apenas healthcheck
# ----------------------------------------------------------------------