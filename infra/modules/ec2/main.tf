data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}


# IAM: permitir que as instâncias façam pull do ECR

resource "aws_iam_role" "ec2" {
  name = "ticket-api-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
      }
    ]
  })

  tags = { IaC = true, Name = "ticket-api-ec2-role" }
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2" {
  name = "ticket-api-ec2-instance-profile"
  role = aws_iam_role.ec2.name
}


# LAUNCH TEMPLATE

resource "aws_launch_template" "this" {
  name_prefix   = "ticket-api-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = var.instance_type
  k
  iam_instance_profile {
    name = aws_iam_instance_profile.ec2.name
  }

  vpc_security_group_ids = var.sg_ids

  user_data = base64encode(templatefile("${path.module}/user_data.sh.tpl", {
    image_url    = var.image_url
    ecr_registry = var.ecr_registry
    image_tag    = var.image_tag
    db_endpoint  = var.db_endpoint
    db_name      = var.db_name
    db_user      = var.db_user
    db_password  = var.db_password
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "ticket-api-ec2"
      IaC  = true
    }
  }
}


# AUTO SCALING GROUP (multi-AZ nas subnets privadas)

resource "aws_autoscaling_group" "this" {
  name                      = "ticket-api-asg"
  min_size                  = var.min_size
  max_size                  = var.max_size
  desired_capacity          = var.desired_size
  vpc_zone_identifier       = var.subnet_ids
  health_check_type         = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.this.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "ticket-api-ec2"
    propagate_at_launch = true
  }

  tag {
    key                 = "IaC"
    value               = true
    propagate_at_launch = true
  }
}

# -----------------------------------------------------------------------------
# SCALING por CPU (target tracking 60%)
# -----------------------------------------------------------------------------
resource "aws_autoscaling_policy" "cpu" {
  name                   = "ticket-api-cpu-tracking"
  autoscaling_group_name = aws_autoscaling_group.this.name
  policy_type            = "TargetTrackingScaling"
  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 60.0
  }
}
