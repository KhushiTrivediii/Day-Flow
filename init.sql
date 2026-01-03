-- Initialize the database with any required setup
-- This file is executed when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (handled by POSTGRES_DB env var)
-- Additional initialization can be added here if needed

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create any additional schemas or initial data here if needed