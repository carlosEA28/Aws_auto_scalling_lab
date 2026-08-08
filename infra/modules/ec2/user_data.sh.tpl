#!/bin/bash
set -euo pipefail

# ----------------------------------------------------------------------
# 1. Instalar e iniciar o Docker (Amazon Linux 2023)
# ----------------------------------------------------------------------
dnf install -y docker
systemctl enable docker
systemctl start docker
systemctl is-active --quiet docker || systemctl restart docker
usermod -aG docker ec2-user

# ----------------------------------------------------------------------
# 2. Login no ECR e pull da imagem
# ----------------------------------------------------------------------
aws ecr get-login-password --region sa-east-1 | docker login \
  --username AWS --password-stdin ${ecr_registry}

docker pull ${image_url}:${image_tag}

# ----------------------------------------------------------------------
# 3. Subir a API apontando para o RDS
# ----------------------------------------------------------------------
docker rm -f ticket-api 2>/dev/null || true

docker run -d --name ticket-api --restart unless-stopped \
  -p 3000:3000 \
  -e HOST=0.0.0.0 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e "DATABASE_URL=postgresql://${db_user}:${db_password}@${db_endpoint}/${db_name}?schema=public" \
  ${image_url}:${image_tag}