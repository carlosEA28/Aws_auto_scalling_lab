output "db_endpoint" {
  description = "Endpoint do RDS"
  value       = aws_db_instance.postgres.endpoint
}

output "db_name" {
  description = "Nome do banco de dados"
  value       = aws_db_instance.postgres.db_name
}

output "db_username" {
  description = "Usuário master do RDS"
  value       = aws_db_instance.postgres.username
}