
# 1. SECURITY GROUP - ALB
#    Permite HTTP da internet e libera egress apontando para as EC2

resource "aws_security_group" "alb" {
  name        = "alb-sg"
  description = "Security Group do Application Load Balancer"
  vpc_id      = var.vpc_id

  tags = {
    Name = "alb-sg"
    IaC  = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
}

resource "aws_vpc_security_group_egress_rule" "alb_to_ec2" {
  security_group_id            = aws_security_group.alb.id
  referenced_security_group_id = aws_security_group.ec2.id
  ip_protocol                  = "tcp"
  from_port                    = 3000
  to_port                      = 3000
}


# 2. SECURITY GROUP - EC2

resource "aws_security_group" "ec2" {
  name        = "ec2-sg"
  description = "Security Group para as instancias EC2"
  vpc_id      = var.vpc_id

  tags = {
    Name = "ec2-sg"
    IaC  = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "ec2_from_alb" {
  security_group_id            = aws_security_group.ec2.id
  referenced_security_group_id = aws_security_group.alb.id
  ip_protocol                  = "tcp"
  from_port                    = 3000
  to_port                      = 3000
}

resource "aws_vpc_security_group_ingress_rule" "ec2_ssh" {
  security_group_id = aws_security_group.ec2.id
  cidr_ipv4         = "189.6.155.66/32"
  ip_protocol       = "tcp"
  from_port         = 22
  to_port           = 22
}

resource "aws_vpc_security_group_egress_rule" "ec2_to_rds" {
  security_group_id            = aws_security_group.ec2.id
  referenced_security_group_id = aws_security_group.rds.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
}

resource "aws_vpc_security_group_egress_rule" "ec2_outbound" {
  security_group_id = aws_security_group.ec2.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}


# 3. SECURITY GROUP - RDS

resource "aws_security_group" "rds" {
  name        = "rds-sg"
  description = "Security Group para o RDS"
  vpc_id      = var.vpc_id

  tags = {
    Name = "rds-sg"
    IaC  = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_ec2" {
  security_group_id            = aws_security_group.rds.id
  referenced_security_group_id = aws_security_group.ec2.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
}
