variable "subnet_ids" {
  description = "IDs das sub-redes privadas para o RDS"
  type        = list(string)
}

variable "sg_ids" {
  description = "IDs dos security groups do RDS"
  type        = list(string)
}

variable "password" {
  description = "Senha do usuário master do RDS"
  type        = string
  sensitive   = true
}