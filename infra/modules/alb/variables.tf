variable "subnet_ids" {
  description = "IDs das sub-redes públicas para o ALB"
  type        = list(string)
}

variable "security_group_id" {
  description = "ID do security group do ALB"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC"
  type        = string
}

variable "target_asg_ids" {
  description = "IDs dos Auto Scaling Groups que serão alvos do target group"
  type        = list(string)
}