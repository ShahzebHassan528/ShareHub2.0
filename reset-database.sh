#!/bin/bash

echo "=========================================="
echo "Database Reset Script"
echo "=========================================="
echo ""
echo "⚠️  WARNING: This will DELETE all existing data!"
echo ""

read -p "Are you sure you want to reset the database? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

echo "Please enter your MySQL root password:"
read -s MYSQL_PASSWORD

echo ""
echo "Dropping existing database..."

mysql -u root -p"$MYSQL_PASSWORD" -e "DROP DATABASE IF EXISTS marketplace_db;" 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Failed to drop database"
    exit 1
fi

echo "Creating fresh database and tables..."

mysql -u root -p"$MYSQL_PASSWORD" < backend/database/schema.sql 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database created successfully!"
    echo ""
    
    read -p "Do you want to insert sample data? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mysql -u root -p"$MYSQL_PASSWORD" < backend/database/seed.sql 2>&1
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Sample data inserted successfully!"
            echo ""
            echo "Sample Accounts (password for all: admin123, buyer123, etc.):"
            echo "  Admin: admin@marketplace.com"
            echo "  Buyer: buyer1@example.com"
            echo "  Seller: seller1@example.com"
            echo "  NGO: ngo1@example.com"
        else
            echo "❌ Failed to insert sample data"
        fi
    fi
    
    echo ""
    echo "=========================================="
    echo "Database reset complete!"
    echo "=========================================="
    echo ""
else
    echo "❌ Failed to create database"
    exit 1
fi
