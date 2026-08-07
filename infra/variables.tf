variable "postgres_password" {
  description = "Senha do usuário master do RDS"
  type        = string
  sensitive   = true
}

variable "ec2_key_name" {
  description = "Nome da key pair para acesso SSH às instâncias EC2"
  type        = string
  default     = "user1"
}