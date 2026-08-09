output "reiya" {
  value = {
    d1_databases = {
      database_id = cloudflare_d1_database.default["reiya"].id
    }
  }
  description = "Reiya D1 databases"
}

output "accounts" {
  value = {
    d1_databases = {
      database_id = cloudflare_d1_database.default["accounts"].id
    }
  }
  description = "Accounts IdP D1 databases"
}