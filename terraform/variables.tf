variable "aws_region" {
  description = "AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "prospecto"
}

variable "environment" {
  description = "Environment name (e.g. production, staging)"
  type        = string
  default     = "production"
}

variable "backend_container_port" {
  description = "Port exposed by the backend container"
  type        = number
  default     = 3001
}

variable "frontend_container_port" {
  description = "Port exposed by the frontend container"
  type        = number
  default     = 80
}

variable "mongodb_uri" {
  description = "MongoDB Connection URI (Atlas cluster string)"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT Signing Secret for the application"
  type        = string
  sensitive   = true
}

variable "anymail_api_key" {
  description = "Anymail API Key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "enrich_api_key" {
  description = "Enrich API Key"
  type        = string
  sensitive   = true
  default     = ""
}
