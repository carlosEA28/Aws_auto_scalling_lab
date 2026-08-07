output "asg_id" {
  description = "ID do Auto Scaling Group"
  value       = aws_autoscaling_group.this.id
}

output "launch_template_id" {
  description = "ID do Launch Template"
  value       = aws_launch_template.this.id
}

output "instance_ami" {
  description = "AMI usada pelo launch template"
  value       = data.aws_ami.amazon_linux_2023.id
}