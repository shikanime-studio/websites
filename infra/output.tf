output "baguetto" {
  value = {
    d1_databases = {
      database_id = cloudflare_d1_database.default["baguetto"].id
    }
  }
  description = "Baguetto D1 databases"
}