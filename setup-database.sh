#!/bin/bash

echo "=========================================="
echo "Database Setup Script"
echo "=========================================="
echo ""

# Check if MySQL is running
if ! systemctl is-active --quiet mysql; then
    echo "MySQL service is not running. Starting MySQL..."
    sudo systemctl start mysql
fi

echo "Please enter your MySQL root password:"
read -s MYSQL_PASSWORD

echo ""
echo "Creating database and tables..."

# Create database and run schema
mysql -u root -p"$MYSQL_PASSWORD" < backend/database/schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database created successfully!"
    echo ""
    
    # Ask if user wants to insert sample data
    read -p "Do you want to insert sample data? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mysql -u root -p"$MYSQL_PASSWORD" < backend/database/seed.sql
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Sample data inserted successfully!"
            echo ""
            echo "Sample Accounts:"
            echo "  Admin: admin@marketplace.com (password: admin123)"
            echo "  Buyer: buyer1@example.com (password: buyer123)"
            echo "  Seller: seller1@example.com (password: seller123)"
            echo "  NGO: ngo1@example.com (password: ngo123)"
        else
            echo "❌ Failed to insert sample data"
        fi
    fi
    
    echo ""
    echo "=========================================="
    echo "Database setup complete!"
    echo "=========================================="
    echo ""
    echo "Now update your backend/.env file with:"
    echo "  DB_HOST=localhost"
    echo "  DB_USER=root"
    echo "  DB_PASSWORD=your_mysql_password"
    echo "  DB_NAME=marketplace_db"
    echo ""
else
    echo "❌ Failed to create database"
    exit 1
fi
