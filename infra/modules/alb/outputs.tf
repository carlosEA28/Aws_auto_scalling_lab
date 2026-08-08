output "alb_dns_name" {
  description = "DNS name do ALB"
  value       = aws_lb.alb.dns_name
}

output "alb_zone_id" {
  description = "Zone ID do ALB"
  value       = aws_lb.alb.zone_id
}

output "target_group_arn" {
  description = "ARN do target group"
  value       = aws_lb_target_group.api.arn
}