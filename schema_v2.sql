-- MySQL dump 10.13  Distrib 8.0.21, for Win64 (x86_64)
--
-- Host: localhost    Database: sigec_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dni` varchar(10) NOT NULL,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `asesor_captador_id` varchar(10) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`),
  UNIQUE KEY `dni_unico` (`dni`),
  KEY `asesor_captador_id` (`asesor_captador_id`),
  KEY `idx_apellidos` (`apellidos`),
  CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`asesor_captador_id`) REFERENCES `empleados` (`legajo`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cotizaciones`
--

DROP TABLE IF EXISTS `cotizaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotizaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int DEFAULT NULL,
  `asesor_id` varchar(10) NOT NULL,
  `plan_id` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo_ingreso` enum('Voluntario','Obligatorio','Monotributo') NOT NULL,
  `es_casado` tinyint(1) NOT NULL DEFAULT '0',
  `aporte_obra_social` decimal(10,2) DEFAULT NULL,
  `descuento_comercial_pct` decimal(4,2) NOT NULL DEFAULT '0.00',
  `descuento_afinidad_pct` decimal(4,2) NOT NULL DEFAULT '0.00',
  `monotributo_categoria` varchar(5) DEFAULT NULL,
  `monotributo_adherentes` int DEFAULT '0',
  `comentarios` text,
  `url_pdf` varchar(255) DEFAULT NULL,
  `valor_base_plan` decimal(12,2) DEFAULT '0.00',
  `valor_descuento_comercial` decimal(12,2) DEFAULT '0.00',
  `valor_descuento_afinidad` decimal(12,2) DEFAULT '0.00',
  `sueldo_bruto` decimal(12,2) DEFAULT '0.00',
  `valor_aportes_estimados` decimal(12,2) DEFAULT '0.00',
  `valor_aporte_monotributo` decimal(12,2) DEFAULT '0.00',
  `valor_iva` decimal(12,2) DEFAULT '0.00',
  `valor_total` decimal(12,2) DEFAULT '0.00',
  `estado` enum('cotizado','afiliado','cancelado','seguimiento','rechazado') DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `descuento_joven_pct` decimal(5,2) DEFAULT '0.00',
  `valor_descuento_joven` decimal(10,2) DEFAULT '0.00',
  `descuento_tarjeta_pct` decimal(5,2) DEFAULT '0.00',
  `valor_descuento_tarjeta` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `asesor_id` (`asesor_id`),
  KEY `plan_id` (`plan_id`),
  KEY `idx_fecha_creacion` (`fecha_creacion`),
  KEY `fk_cotizaciones_clientes_id` (`cliente_id`),
  CONSTRAINT `cotizaciones_ibfk_2` FOREIGN KEY (`asesor_id`) REFERENCES `empleados` (`legajo`) ON DELETE CASCADE,
  CONSTRAINT `cotizaciones_ibfk_3` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_cotizaciones_clientes_id` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `empleados`
--

DROP TABLE IF EXISTS `empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleados` (
  `legajo` varchar(10) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `segundo_nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) NOT NULL,
  `segundo_apellido` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('administrador','supervisor','asesor') NOT NULL,
  `supervisor_id` varchar(10) DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'inactivo',
  `email_confirmado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expires` datetime DEFAULT NULL,
  `activation_token` varchar(255) DEFAULT NULL,
  `activation_token_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`legajo`),
  UNIQUE KEY `email` (`email`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `idx_apellido` (`apellido`),
  CONSTRAINT `empleados_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `empleados` (`legajo`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `listas_de_precios`
--

DROP TABLE IF EXISTS `listas_de_precios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listas_de_precios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `lista_nombre` varchar(100) NOT NULL DEFAULT 'Lista General',
  `tipo_ingreso` varchar(50) NOT NULL,
  `rango_etario` varchar(50) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `listas_de_precios_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `miembros_cotizacion`
--

DROP TABLE IF EXISTS `miembros_cotizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `miembros_cotizacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cotizacion_id` int NOT NULL,
  `parentesco` varchar(50) NOT NULL,
  `edad` tinyint unsigned NOT NULL,
  `valor_individual` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cotizacion_id` (`cotizacion_id`),
  CONSTRAINT `miembros_cotizacion_ibfk_1` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monotributo_aportes`
--

DROP TABLE IF EXISTS `monotributo_aportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monotributo_aportes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoria` varchar(45) NOT NULL,
  `aporte` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categoria_UNIQUE` (`categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `planes`
--

DROP TABLE IF EXISTS `planes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `detalles` text,
  `condiciones_generales` text,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-23 14:56:35
