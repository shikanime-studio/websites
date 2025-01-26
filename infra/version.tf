terraform {
  required_version = "~> 1.8"
  cloud {
    hostname     = "app.terraform.io"
    organization = "shikanime-studio"
    workspaces {
      name = "websites"
    }
  }
  required_providers {
    cloudflare = {
      version = "5.0.0-rc1"
    }
  }
}
