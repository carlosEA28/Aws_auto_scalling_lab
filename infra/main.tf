module "vpc" {
  source = "./modules/vpc"
}

module "security_groups" {
  source = "./modules/security_groups"
  vpc_id = module.vpc.vpc_id
}

module "rds" {
  source     = "./modules/rds"
  subnet_ids = module.vpc.private_subnet_ids
  sg_ids     = [module.security_groups.rds_security_group_id]
  password   = var.postgres_password
}
