output "repository_url" {
  description = "URL do repositório ECR"
  value       = aws_ecr_repository.this.repository_url
}

output "repository_name" {
  description = "Nome do repositório ECR"
  value       = aws_ecr_repository.this.name
}

output "registry" {
  description = "Endpoint do registry ECR (sem o nome do repositório)"
  value       = regexp("^[^/]+", aws_ecr_repository.this.repository_url)
}