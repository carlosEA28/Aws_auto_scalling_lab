# ------------------------------------------------------------------------------
# 1. VPC & INTERNET GATEWAY
# ------------------------------------------------------------------------------
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    IaC  = true
    Name = "Main VPC"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    IaC  = true
    Name = "Internet Gateway"
  }
}

# ------------------------------------------------------------------------------
# 2. SUB-REDES PÚBLICAS
# ------------------------------------------------------------------------------
resource "aws_subnet" "public_az1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "sa-east-1a"
  map_public_ip_on_launch = true

  tags = {
    IaC  = true
    Name = "Public Subnet sa-east-1a"
  }
}

resource "aws_subnet" "public_az2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "sa-east-1b"
  map_public_ip_on_launch = true

  tags = {
    IaC  = true
    Name = "Public Subnet sa-east-1b"
  }
}

# ------------------------------------------------------------------------------
# 3. SUB-REDES PRIVADAS
# ------------------------------------------------------------------------------
resource "aws_subnet" "private_az1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "sa-east-1a"

  tags = {
    IaC  = true
    Name = "Private Subnet sa-east-1a"
  }
}

resource "aws_subnet" "private_az2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "sa-east-1b"

  tags = {
    IaC  = true
    Name = "Private Subnet sa-east-1b"
  }
}

# ------------------------------------------------------------------------------
# 4. ELASTIC IPs & NAT GATEWAYS (Para saída das Sub-redes Privadas)
# ------------------------------------------------------------------------------
resource "aws_eip" "nat_az1" {
  domain     = "vpc"
  depends_on = [aws_internet_gateway.gw]

  tags = {
    IaC  = true
    Name = "EIP NAT sa-east-1a"
  }
}

resource "aws_eip" "nat_az2" {
  domain     = "vpc"
  depends_on = [aws_internet_gateway.gw]

  tags = {
    IaC  = true
    Name = "EIP NAT sa-east-1b"
  }
}

resource "aws_nat_gateway" "nat_gw_az1" {
  allocation_id = aws_eip.nat_az1.id
  subnet_id     = aws_subnet.public_az1.id

  tags = {
    IaC  = true
    Name = "NAT Gateway sa-east-1a"
  }

  depends_on = [aws_internet_gateway.gw]
}

resource "aws_nat_gateway" "nat_gw_az2" {
  allocation_id = aws_eip.nat_az2.id
  subnet_id     = aws_subnet.public_az2.id

  tags = {
    IaC  = true
    Name = "NAT Gateway sa-east-1b"
  }

  depends_on = [aws_internet_gateway.gw]
}

# ------------------------------------------------------------------------------
# 5. ROUTE TABLES & ASSOCIAÇÕES - PÚBLICAS
# ------------------------------------------------------------------------------
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    IaC  = true
    Name = "Public Route Table"
  }
}

resource "aws_route_table_association" "public_az1" {
  subnet_id      = aws_subnet.public_az1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_az2" {
  subnet_id      = aws_subnet.public_az2.id
  route_table_id = aws_route_table.public.id
}

# ------------------------------------------------------------------------------
# 6. ROUTE TABLES & ASSOCIAÇÕES - PRIVADAS (Roteando pelo NAT Gateway)
# ------------------------------------------------------------------------------
resource "aws_route_table" "private_az1" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw_az1.id
  }

  tags = {
    IaC  = true
    Name = "Private Route Table sa-east-1a"
  }
}

resource "aws_route_table_association" "private_az1" {
  subnet_id      = aws_subnet.private_az1.id
  route_table_id = aws_route_table.private_az1.id
}

resource "aws_route_table" "private_az2" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw_az2.id
  }

  tags = {
    IaC  = true
    Name = "Private Route Table sa-east-1b"
  }
}

resource "aws_route_table_association" "private_az2" {
  subnet_id      = aws_subnet.private_az2.id
  route_table_id = aws_route_table.private_az2.id
}
