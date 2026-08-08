resource "aws_lb" "alb" {
  name               = "ticket-api-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = var.subnet_ids

  enable_deletion_protection = true

  tags = {
    IaC = true
    Name = "ticket-api-alb"
  }
}

resource "aws_lb_target_group" "api" {
  name        = "ticket-api-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance"

  health_check {
    path                = "/health"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = {
    IaC  = true
    Name = "ticket-api-tg"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

resource "aws_autoscaling_attachment" "api" {
  count                  = length(var.target_asg_ids)
  autoscaling_group_name = var.target_asg_ids[count.index]
  lb_target_group_arn     = aws_lb_target_group.api.arn
}