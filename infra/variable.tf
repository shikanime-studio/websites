variable "account" {
  type        = string
  description = "Cloudflare account ID"
  default     = "d4e789904d6943d8cd524e19c5cb36bd"
}

variable "zone" {
  type        = string
  description = "Cloudflare zone ID"
  default     = "6c9b58fc27fe154e5ac9addbc872fa9d"
}

variable "projects" {
  type        = map(string)
  description = "Map of Cloudflare Pages projects"
  default = {
    shikanime-studio = "shikanime-studio"
    reiya            = "reiya"
    links            = "links"
  }
}

variable "dns_records" {
  type = map(object({
    name    = string
    project = string
  }))
  description = "Map of DNS records"
  default = {
    shikanime-studio = {
      name    = "shikanime.studio"
      project = "shikanime-studio"
    }
    reiya = {
      name    = "reiya.shikanime.studio"
      project = "reiya"
    }
    links = {
      name    = "links.shikanime.studio"
      project = "links"
    }
  }
}

variable "d1s" {
  type        = map(string)
  description = "Map of Cloudflare D1 databases"
  default = {
    reiya = "reiya"
  }
}