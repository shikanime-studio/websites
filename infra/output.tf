output "reiya" {
  value = {
    d1_databases = {
      database_id = cloudflare_d1_database.default["reiya"].id
    }
  }
  description = "Reiya D1 databases"
}