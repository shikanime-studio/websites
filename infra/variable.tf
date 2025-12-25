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
    links    = "links"
    reiya = "reiya"
    www      = "www"
  }
}

variable "dns_records" {
  type = map(object({
    name    = string
    project = string
  }))
  description = "Map of DNS records"
  default = {
    links = {
      name    = "links.shikanime.studio"
      project = "links"
    }
    reiya = {
      name    = "reiya.shikanime.studio"
      project = "reiya"
    }
    www = {
      name    = "shikanime.studio"
      project = "www"
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