variable "image_url" {
  description = "URL da imagem Docker no ECR"
  type        = string
}

variable "ecr_registry" {
  description = "Endpoint do registry ECR (apenas host, sem o nome do repositório)"
  type        = string
}

variable "image_tag" {
  description = "Tag da imagem Docker que a EC2 deve baixar"
  type        = string
  default     = "latest"
}

variable "db_endpoint" {
  description = "Endpoint do RDS (host:port)"
  type        = string
}

variable "db_name" {
  description = "Nome do banco de dados"
  type        = string
}

variable "db_user" {
  description = "Usuário do banco de dados"
  type        = string
}

variable "db_password" {
  description = "Senha do banco de dados"
  type        = string
  sensitive   = true
}

variable "subnet_ids" {
  description = "IDs das sub-redes privadas para o ASG"
  type        = list(string)
}

variable "sg_ids" {
  description = "IDs dos security groups das instâncias"
  type        = list(string)
}

variable "key_name" {
  description = "Chave SSH para acesso às instâncias"
  type        = string
}

variable "instance_type" {
  description = "Tipo da instância"
  type        = string
  default     = "t3.micro"
}

variable "min_size" {
  description = "Mínimo de instâncias"
  type        = number
  default     = 2
}

variable "max_size" {
  description = "Máximo de instâncias"
  type        = number
  default     = 6
}

variable "desired_size" {
  description = "Qtd desejada de instâncias"
  type        = number
  default     = 2
}
