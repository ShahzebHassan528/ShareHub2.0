-- ============================================================
-- ShareHub 2.0 — Full Database Dump
-- Generated: 2026-04-03
-- MariaDB / MySQL compatible
--
-- SETUP INSTRUCTIONS:
--   Option A (command line):
--     mysql -u root -p < sharehub_dump.sql
--
--   Option B (phpMyAdmin / HeidiSQL / DBeaver):
--     Import this file via the GUI.
--
--   After import, update backend/.env:
--     DB_HOST=127.0.0.1
--     DB_PORT=3306
--     DB_NAME=marketplace_db
--     DB_USER=root
--     DB_PASS=          ← leave blank if no password
-- ============================================================

CREATE DATABASE IF NOT EXISTS `marketplace_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `marketplace_db`;

-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: marketplace_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_logs`
--

DROP TABLE IF EXISTS `admin_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL,
  `action_type` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `admin_logs_admin_id` (`admin_id`),
  KEY `admin_logs_action_type` (`action_type`),
  CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_logs`
--

LOCK TABLES `admin_logs` WRITE;
/*!40000 ALTER TABLE `admin_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `categories_parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `donations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `donor_id` int(11) NOT NULL,
  `ngo_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `donation_number` varchar(50) NOT NULL,
  `status` enum('pending','accepted','rejected','completed') DEFAULT 'pending',
  `message` text DEFAULT NULL,
  `pickup_address` text DEFAULT NULL,
  `pickup_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `donation_number` (`donation_number`),
  KEY `product_id` (`product_id`),
  KEY `donations_donor_id` (`donor_id`),
  KEY `donations_ngo_id` (`ngo_id`),
  KEY `donations_status` (`status`),
  CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `donations_ibfk_2` FOREIGN KEY (`ngo_id`) REFERENCES `ngos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `donations_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donations`
--

LOCK TABLES `donations` WRITE;
/*!40000 ALTER TABLE `donations` DISABLE KEYS */;
INSERT INTO `donations` VALUES (1,2,2,6,'DON1775161575989','accepted','Testing Donation Item request.',NULL,NULL,'2026-04-02 20:26:15','2026-04-02 20:35:50'),(2,2,2,4,'DON1775161702797','rejected','Testing donation request.',NULL,NULL,'2026-04-02 20:28:22','2026-04-02 20:33:12'),(3,2,2,4,'DON1775212653610','accepted','Donating Product.',NULL,NULL,'2026-04-03 10:37:33','2026-04-03 10:38:58');
/*!40000 ALTER TABLE `donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sender_receiver` (`sender_id`,`receiver_id`),
  KEY `idx_receiver_unread` (`receiver_id`,`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,2,4,'Hello.',1,'2026-04-03 11:10:25'),(2,4,2,'Hi.',1,'2026-04-03 11:12:13');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ngos`
--

DROP TABLE IF EXISTS `ngos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ngos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `ngo_name` varchar(255) NOT NULL,
  `registration_number` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `certificate_document` varchar(255) DEFAULT NULL,
  `verification_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `registration_number` (`registration_number`),
  KEY `verified_by` (`verified_by`),
  KEY `ngos_verification_status` (`verification_status`),
  CONSTRAINT `ngos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ngos_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ngos`
--

LOCK TABLES `ngos` WRITE;
/*!40000 ALTER TABLE `ngos` DISABLE KEYS */;
INSERT INTO `ngos` VALUES (1,6,'Help Foundation','NGO123456','789 Charity Lane, City',NULL,NULL,NULL,'',1,'2026-03-11 01:20:24',NULL,NULL,NULL,'2026-03-11 01:20:24'),(2,7,'Care Society','NGO789012','321 Service St, Town',NULL,NULL,NULL,'approved',1,'2026-03-11 02:41:40',NULL,NULL,NULL,'2026-03-11 01:20:24');
/*!40000 ALTER TABLE `ngos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id` (`user_id`),
  KEY `notifications_is_read` (`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'Order Update','Your order for \"Your order\" is now confirmed','order',1,'2026-04-02 15:01:58'),(2,2,'Order Update','Your order for \"Your order\" is now confirmed','order',1,'2026-04-02 15:02:01'),(3,2,'Order Update','Your order for \"Your order\" is now shipped','order',1,'2026-04-02 15:02:06'),(4,2,'Order Update','Your order for \"Your order\" is now delivered','order',1,'2026-04-02 15:02:07'),(5,2,'Donation Received','NGO has made a donation of $0','donation',1,'2026-04-02 20:35:50'),(6,2,'Order Update','Your order for \"Your order\" is now confirmed','order',0,'2026-04-03 10:35:56'),(7,2,'Order Update','Your order for \"Your order\" is now shipped','order',0,'2026-04-03 10:36:03'),(8,2,'Order Update','Your order for \"Your order\" is now delivered','order',0,'2026-04-03 10:36:07'),(9,2,'Donation Received','NGO has made a donation of $0','donation',0,'2026-04-03 10:38:58'),(10,4,'New Message','You have received a new message from John Doe','message',1,'2026-04-03 11:10:25'),(11,2,'New Message','You have received a new message from Tech Store Owner','message',0,'2026-04-03 11:12:13');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `product_condition` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `seller_id` (`seller_id`),
  KEY `order_items_order_id` (`order_id`),
  KEY `order_items_product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,6,1,1,14590.00,NULL,'2026-04-01 16:50:44'),(2,2,4,1,1,6750.00,NULL,'2026-04-02 14:32:26'),(3,3,4,1,1,6750.00,NULL,'2026-04-03 10:34:55');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `buyer_id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `shipping_address` text NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `orders_buyer_id` (`buyer_id`),
  KEY `orders_status` (`status`),
  KEY `orders_order_number` (`order_number`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,2,'ORD1775062244375',14590.00,'confirmed','pending',NULL,'Flat 60 Qureshi Camp Cantt, Lahore, 54400','','2026-04-01 16:50:44','2026-04-02 15:02:01'),(2,2,'ORD1775140346036',6750.00,'delivered','pending',NULL,'Flat 60 Qureshi Camp Cantt, Lahore, 54400','','2026-04-02 14:32:26','2026-04-02 15:02:07'),(3,2,'ORD1775212495709',6750.00,'delivered','pending',NULL,'Flat 60 Qureshi Camp Cantt, Lahore, 54400','Deliver fast.','2026-04-03 10:34:55','2026-04-03 10:36:07');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_images_product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,8,'/uploads/products/OIP-1775214116914-480482162.jpg',1,0,'2026-04-03 11:01:56');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_swaps`
--

DROP TABLE IF EXISTS `product_swaps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_swaps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requester_id` int(11) NOT NULL,
  `requester_product_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `owner_product_id` int(11) NOT NULL,
  `swap_number` varchar(50) NOT NULL,
  `status` enum('pending','accepted','rejected','completed') DEFAULT 'pending',
  `message` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `swap_number` (`swap_number`),
  KEY `requester_product_id` (`requester_product_id`),
  KEY `owner_product_id` (`owner_product_id`),
  KEY `product_swaps_requester_id` (`requester_id`),
  KEY `product_swaps_owner_id` (`owner_id`),
  KEY `product_swaps_status` (`status`),
  CONSTRAINT `product_swaps_ibfk_1` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `product_swaps_ibfk_2` FOREIGN KEY (`requester_product_id`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `product_swaps_ibfk_3` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `product_swaps_ibfk_4` FOREIGN KEY (`owner_product_id`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_swaps`
--

LOCK TABLES `product_swaps` WRITE;
/*!40000 ALTER TABLE `product_swaps` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_swaps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `seller_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `product_condition` enum('new','like_new','good','fair','poor') NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `is_available` tinyint(1) DEFAULT 1,
  `is_approved` tinyint(1) DEFAULT 0,
  `product_status` enum('active','blocked') DEFAULT 'active',
  `blocked_at` datetime DEFAULT NULL,
  `blocked_by` int(11) DEFAULT NULL,
  `block_reason` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `blocked_by` (`blocked_by`),
  KEY `approved_by` (`approved_by`),
  KEY `products_seller_id` (`seller_id`),
  KEY `products_category_id` (`category_id`),
  KEY `products_product_condition` (`product_condition`),
  KEY `products_is_available` (`is_available`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_3` FOREIGN KEY (`blocked_by`) REFERENCES `users` (`id`),
  CONSTRAINT `products_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (4,1,NULL,'Test product 2','Testing Edit product feature on product 2',6750.00,'good',1,1,1,'active',NULL,NULL,NULL,NULL,0,NULL,NULL,'Lahore, PAkistan','2026-03-19 03:36:01','2026-04-03 10:41:47'),(6,1,NULL,'test product','admin product count',14590.00,'new',1,1,1,'active',NULL,NULL,NULL,NULL,0,NULL,NULL,'Ali Park, Lahore, Pakistan','2026-03-19 04:19:38','2026-04-03 10:41:44'),(7,1,NULL,'Phone','Testing phone listing',18000.00,'like_new',1,1,1,'active',NULL,NULL,NULL,NULL,0,NULL,NULL,'Lahore, Pakistan','2026-04-03 10:42:15','2026-04-03 10:42:15'),(8,1,NULL,'Phone','Phone listing testing',17000.00,'fair',1,1,1,'active',NULL,NULL,NULL,NULL,0,NULL,NULL,'Ali Park, Lahore, Pakistan','2026-04-03 10:51:08','2026-04-03 11:01:56');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `buyer_id` (`buyer_id`),
  KEY `reviews_product_id` (`product_id`),
  KEY `reviews_seller_id` (`seller_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sellers`
--

DROP TABLE IF EXISTS `sellers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sellers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `business_address` text DEFAULT NULL,
  `business_license` varchar(255) DEFAULT NULL,
  `tax_id` varchar(100) DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `total_sales` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `approved_by` (`approved_by`),
  KEY `sellers_approval_status` (`approval_status`),
  CONSTRAINT `sellers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sellers_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellers`
--

LOCK TABLES `sellers` WRITE;
/*!40000 ALTER TABLE `sellers` DISABLE KEYS */;
INSERT INTO `sellers` VALUES (1,4,'Tech Store','123 Main St, City','LIC123456',NULL,'approved',1,'2026-03-11 01:20:24',NULL,0.00,0,'2026-03-11 01:20:24'),(2,5,'Fashion Hub','456 Market Rd, Town','LIC789012',NULL,'rejected',1,NULL,'don\'t want him',0.00,0,'2026-03-11 01:20:24');
/*!40000 ALTER TABLE `sellers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `profile_image` varchar(500) DEFAULT NULL,
  `role` enum('admin','seller','buyer','ngo') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_suspended` tinyint(1) DEFAULT 0,
  `suspended_at` datetime DEFAULT NULL,
  `suspended_by` int(11) DEFAULT NULL,
  `suspension_reason` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `suspended_by` (`suspended_by`),
  KEY `users_email` (`email`),
  KEY `users_role` (`role`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`suspended_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@marketplace.com','$2b$10$zOJ86SB7gqhGHuQL1zlLbujNJ4pVGCrhqxc73KMlsZWlLpPPDyXNS','Admin User','1234567890',NULL,NULL,'admin',1,1,0,NULL,NULL,NULL,'2026-03-11 01:20:24','2026-03-11 01:20:24'),(2,'buyer1@example.com','$2b$10$tT2XmMSW.oBgaLVxxuy5reUIQ1FgJj4Tf4iCGL7pqNr4hibKGW.OC','John Doe','9876543210',NULL,NULL,'buyer',1,1,0,NULL,NULL,NULL,'2026-03-11 01:20:24','2026-03-11 01:20:24'),(3,'buyer2@example.com','$2b$10$tT2XmMSW.oBgaLVxxuy5reUIQ1FgJj4Tf4iCGL7pqNr4hibKGW.OC','Jane Smith','9876543211',NULL,NULL,'buyer',1,1,0,NULL,NULL,NULL,'2026-03-11 01:20:24','2026-03-11 01:20:24'),(4,'seller1@example.com','$2b$10$de0cUC2XOGaexqHYsZbo4ONVz9R2sRdKmAm3wqxyk8yJtjRkPl6AG','Tech Store Owner','9876543212',NULL,NULL,'seller',1,1,0,NULL,NULL,NULL,'2026-03-11 01:20:24','2026-03-11 01:20:24'),(5,'seller2@example.com','$2b$10$de0cUC2XOGaexqHYsZbo4ONVz9R2sRdKmAm3wqxyk8yJtjRkPl6AG','Fashion Hub Owner','9876543213',NULL,NULL,'seller',1,0,0,NULL,NULL,NULL,'2026-03-11 01:20:24','2026-03-11 01:20:24'),(6,'ngo1@example.com','$2b$10$mdRi92iAqyt1Yd230xL.ney.Ww.1i7pz.T/aY9M1yQUZJDavA/qxu','Help Foundation','9876543214',NULL,NULL,'ngo',1,1,0,NULL,NULL,NULL,'2026-03-11 01:20:24','2026-03-11 01:20:24'),(7,'ngo2@example.com','$2b$10$mdRi92iAqyt1Yd230xL.ney.Ww.1i7pz.T/aY9M1yQUZJDavA/qxu','Care Society','9876543215',NULL,NULL,'ngo',1,0,0,NULL,NULL,NULL,'2026-03-11 01:20:24','2026-03-11 01:20:24');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'marketplace_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-03 16:16:38
