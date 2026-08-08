resource "aws_db_subnet_group" "postgres" {
  name       = "postgres-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "postgres-subnet-group"
    IaC  = true
  }
}

resource "aws_db_instance" "postgres" {
  allocated_storage       = 10
  db_name                 = "ticketing"
  instance_class          = "db.t3.micro"
  engine                  = "postgres"
  engine_version          = "15"
  username                = "ticket"
  password                = var.password
  db_subnet_group_name    = aws_db_subnet_group.postgres.name
  vpc_security_group_ids  = var.sg_ids
  multi_az                = true
  skip_final_snapshot     = true
  backup_retention_period = 7
  tags = {
    Name = "postgres-rds"
    IaC  = true
  }
}
