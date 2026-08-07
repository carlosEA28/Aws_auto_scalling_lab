output "alb_security_group_id" {
  description = "ID do security group do ALB"
  value       = aws_security_group.alb.id
}

output "ec2_security_group_id" {
  description = "ID do security group da EC2"
  value       = aws_security_group.ec2.id
}

output "rds_security_group_id" {
  description = "ID do security group do RDS"
  value       = aws_security_group.rds.id
}