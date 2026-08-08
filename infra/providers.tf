terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.58.0"
    }
  }

  backend "s3" {
      bucket         = "auto-scalling-backend" # Nome do seu bucket S3
      key            = "infra/terraform.tfstate"
      region         = "sa-east-1"
    }
}

provider "aws" {
  region = "sa-east-1"
}
