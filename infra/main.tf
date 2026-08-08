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

module "ecr" {
  source = "./modules/ecr"
}

module "ec2" {
  source       = "./modules/ec2"
  image_url    = module.ecr.repository_url
  ecr_registry = module.ecr.registry
  image_tag    = var.ecr_image_tag
  db_endpoint  = module.rds.db_endpoint
  db_name      = module.rds.db_name
  db_user      = module.rds.db_username
  db_password  = var.postgres_password
  subnet_ids   = module.vpc.private_subnet_ids
  sg_ids       = [module.security_groups.ec2_security_group_id]
}

module "alb" {
  source            = "./modules/alb"
  subnet_ids        = module.vpc.public_subnet_ids
  security_group_id = module.security_groups.alb_security_group_id
  vpc_id            = module.vpc.vpc_id
  target_asg_ids    = [module.ec2.asg_id]
}
