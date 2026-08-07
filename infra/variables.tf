variable "postgres_password" {
  description = "Senha do usuário master do RDS"
  type        = string
  sensitive   = true
}