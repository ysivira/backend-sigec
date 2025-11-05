/*
-- -----------------------------------------------------------
-- Archivo de "Semillado" (Seeding) de SIGEC
-- Contiene los datos mínimos para que la aplicación funcione.
-- Ejecutar DESPUÉS de 'schema.sql'.
-- -----------------------------------------------------------
*/

/* 1. Planes (Basados en [35-1044], modificados según [35-1040]) */
/* Se renombra 'Plan RUBÍ' a 'Basico' y 'Plan ZAFIRO' a 'Premium' */
/* Se omiten los planes 2 y 4 para un semillado limpio */
LOCK TABLES `planes` WRITE;
INSERT INTO `planes` VALUES 
(1,'Basico','Análisis de Laboratorio| SC-ST-SL|NO\nCirugía de Ojos Excimer Láser (1 año de permanencia)| 50% CT-CL|NO\nConsultas – Consultorio | SC-ST-SL|NO\nConsultas – Domicilio| CC-ST-SL|NO\nFonoaudiología| SC-CT (40 Sesiones)|NO\nInternaciones Clínicas y/o Quirúrgicas| SC-ST-SL|NO\nInternaciones Psiquiátricas| SC-CT (30 días)|NO\nKinesiología – Fisiatría| SC-CT (25 sesiones)|NO\nMaterial Descartable Internación | 100%|NO\nMaternidad | 100%|NO\nMedicamentos Ambulatorios| 40%|NO\nMedicamentos en Internación| 100%|NO\nMedicamentos Oncológicos (según P.M.O.)| 100%|NO\nOdontología General| SC-ST-SL|NO\nOrtesis Nacionales (según P.M.O.)| 50%|NO\nPlan Materno Infantil| 100%|NO\nPrácticas Médicas de Diagnóstico y Tratamiento| SC-ST-SL|NO\nPrótesis Nacionales (según P.M.O.)| 100%|NO\nPsicología – Psiquiatría| CC-CT (30 sesiones)|NO\nTipo de Habitación| Compartida|NO\nTipo de Habitación Maternal| Compartida|NO\nUnidad de Terapia Intensiva| SC-ST-SL|NO','Cobertura: BRASIL.\n\nReferencias: SC (Sin Cargo) | ST (Sin Tope) | SL (Sin Límite) | CC (Con Cargo) | CT (Con Tope) | CL (Con Límite) | NA (No Acumulable)',1),
(3,'Premium','Análisis de Laboratorio | SC-ST-SL | CT-CL \n Cirugía de Ojos Excimer Láser (1 año de permanencia) | CT-CL |CT-CL \n  Consultas - Consultorio | SC-ST-SL | CT-CL\n Consultas Domicilio | CC-ST-SL | CT-CL\n Cirugía Estética (2 años de permanencia)| CT-CL (1 cada 4 años aniversario) | CT-CL  \n  Escleroterapia | SC-CT (8 sesiones por año aniversario) |CT-CL (por año aniversario) \n Fonoaudiología | SC-CT (56 Sesiones) | CT-CL\n Internaciones Clínicas y/o Quirúrgicas | SC-ST-SL | CT-CL\n Acompañante en Internación (hasta 17 años inclusive) | 100% |CT-CL \n Acompañante en Internación (mayores de 18 años con autorización expresa de Auditoria Médica | SC-CT-CL (3 días por año) | CT-CL  \n Internaciones Psiquiátricas | SC-CT (60 sesiones) | NO\n  Kinesiología - Fisiatría | SC-CT (40 sesiones) | CT-CL\n Material Descartable Internación | 100% | CT-CL\n Maternidad | 100% | CT-CL\n Medicamentos Ambulatorios | 40% | NO \n Medicamentos en Internación | 100% | CT-CL\n Medicamentos Oncológicos (según P.M.O.) | 100% | NO\n Odontología General | SC-ST-SL | CT (por año NA) \n Odontología –Blanqueamiento Dental | Por Reintegro| CT (1 cada 4 años) \n Odontología – Implantes (1 año de permanencia) | Por Reintegro | CT (por año NA) \n Odontología – Prótesis (1 año de permanencia) | CT-CL (por año NA) \n Ortodoncia (de 8 a 18 años por única vez) | Por Reintegro | CT-CL (por año NA) \n Ortesis Nacionales (según P.M.O.) | 50% | CT-CL\n  Plan Materno Infantil | 100%| CT-CL\n Prácticas Médicas de Diagnóstico y Tratamiento | SC-ST-SL | CT-CL\n Prótesis Nacionales (según P.M.O.) | 100% | NO \n Psicología - Psiquiatría | CC-CT (30 sesiones) | CT-CL (60 sesiones) \n Servicio de Asistencia al Viajero. Cobertura Internacional | CT-CL |NO\n Tipo de Habitación | Individual | CT-CL\n Tipo de Habitación Maternal | Individual | CT-CL\n  Unidad de Terapia Intensiva | SC-ST-SL | CT-CL','Servicio de Asistencia al Viajero. Cobertura Internacional. Tratado de Schengen.\n\nReferencias: SC (Sin Cargo) | ST (Sin Tope) | SL (Sin Límite) | CC (Con Cargo) | CT (Con Tope) | CL (Con Límite) | NA (No Acumulable)',1);
UNLOCK TABLES;

/* 2. Aportes de Monotributo (Datos de [35-1044]) */
LOCK TABLES `monotributo_aportes` WRITE;
INSERT INTO `monotributo_aportes` VALUES (1,'A',16353.97),(2,'B',16353.97),(3,'C',16353.97),(4,'D',19435.17),(5,'E',23701.42),(6,'F',27256.64),(7,'G',29389.76),(8,'H',35315.11),(9,'I',43610.62),(10,'J',48943.43),(11,'K',55935.36),(12,'Adherente',14208.87);
UNLOCK TABLES;

/* 3. Listas de Precios (Datos de [35-1044], modificados según [35-1040]) */
/* Precios de plan_id 1 y 3 reducidos en 23%. Se omiten planes 2 y 4. */
LOCK TABLES `listas_de_precios` WRITE;
INSERT INTO `listas_de_precios` VALUES 
(1,1,'Lista General 2025','Obligatorio','0-25',129228.84,1),
(3,3,'Lista General 2025','Obligatorio','0-25',233922.78,1),
(5,1,'Lista General 2025','Obligatorio','0-17',11550.00,0),
(7,3,'Lista General 2025','Obligatorio','26-35',233922.78,1),
(9,1,'Lista General 2025','Obligatorio','36-40',143863.65,1),
(11,3,'Lista General 2025','Obligatorio','36-40',293883.37,1),
(13,1,'Lista General 2025','Obligatorio','41-50',149562.94,1),
(15,3,'Lista General 2025','Obligatorio','41-50',321203.63,1),
(17,1,'Lista General 2025','Obligatorio','51-60',223555.71,1),
(19,3,'Lista General 2025','Obligatorio','51-60',460201.41,1),
(21,1,'Lista General 2025','Obligatorio','61-65',387685.84,1),
(23,3,'Lista General 2025','Obligatorio','61-65',701769.10,1),
(25,1,'Lista General 2025','Obligatorio','66-00',387685.84,1),
(27,3,'Lista General 2025','Obligatorio','66-00',701769.10,1),
(29,1,'Lista General 2025','Obligatorio','MAT 0-25',181795.95,1),
(31,3,'Lista General 2025','Obligatorio','MAT 0-25',328895.41,1),
(33,1,'Lista General 2025','Obligatorio','MAT 26-35',245542.18,1),
(35,3,'Lista General 2025','Obligatorio','MAT 26-35',444454.64,1),
(37,1,'Lista General 2025','Obligatorio','MAT 36-40',273350.69,1),
(39,3,'Lista General 2025','Obligatorio','MAT 36-40',558378.55,1),
(41,1,'Lista General 2025','Obligatorio','MAT 41-50',284160.14,1),
(43,3,'Lista General 2025','Obligatorio','MAT 41-50',610286.03,1),
(45,1,'Lista General 2025','Obligatorio','MAT 51-60',424772.54,1),
(47,3,'Lista General 2025','Obligatorio','MAT 51-60',874378.53,1),
(49,1,'Lista General 2025','Obligatorio','MAT 61-65',736629.96,1),
(51,3,'Lista General 2025','Obligatorio','MAT 61-65',1333360.50,1),
(53,1,'Lista General 2025','Obligatorio','MAT 66-00',736613.59,1),
(55,3,'Lista General 2025','Obligatorio','MAT 66-00',1333360.50,1),
(57,1,'Lista General 2025','Obligatorio','HIJO 0-1(*)',68707.11,1),
(59,3,'Lista General 2025','Obligatorio','HIJO 0-1(*)',126967.00,1),
(61,1,'Lista General 2025','Obligatorio','HIJO 2-20',54965.69,1),
(63,3,'Lista General 2025','Obligatorio','HIJO 2-20',82528.07,1),
(65,1,'Lista General 2025','Obligatorio','HIJO 21-29',135690.29,1),
(67,3,'Lista General 2025','Obligatorio','HIJO 21-29',245619.23,1),
(69,1,'Lista General 2025','Obligatorio','HIJO 30-39',151057.89,1),
(71,3,'Lista General 2025','Obligatorio','HIJO 30-39',308576.96,1),
(73,1,'Lista General 2025','Obligatorio','HIJO 40-49',157040.00,1),
(75,3,'Lista General 2025','Obligatorio','HIJO 40-49',337263.62,1),
(77,1,'Lista General 2025','Obligatorio','FAMILIAR A CARGO',407060.30,1),
(79,3,'Lista General 2025','Obligatorio','FAMILIAR A CARGO',736858.24,1),
(81,1,'Lista General 2025','Voluntario','0-25',138325.29,1),
(83,3,'Lista General 2025','Voluntario','0-25',250387.75,1),
(85,1,'Lista General 2025','Voluntario','26-35',138325.29,1),
(87,3,'Lista General 2025','Voluntario','26-35',250387.75,1),
(89,1,'Lista General 2025','Voluntario','36-40',153990.00,1),
(91,3,'Lista General 2025','Voluntario','36-40',314569.03,1),
(93,1,'Lista General 2025','Voluntario','41-50',159900.00,1),
(95,3,'Lista General 2025','Voluntario','41-50',343813.92,1),
(97,1,'Lista General 2025','Voluntario','51-60',239290.00,1),
(99,3,'Lista General 2025','Voluntario','51-60',492590.00,1),
(101,1,'Lista General 2025','Voluntario','61-65',414970.00,1),
(103,3,'Lista General 2025','Voluntario','61-65',751160.00,1),
(105,1,'Lista General 2025','Voluntario','66-00',414970.00,1),
(107,3,'Lista General 2025','Voluntario','66-00',751160.00,1),
(109,1,'Lista General 2025','Voluntario','MAT 0-25',194480.00,1),
(111,3,'Lista General 2025','Voluntario','MAT 0-25',352044.42,1),
(113,1,'Lista General 2025','Voluntario','MAT 26-35',262800.00,1),
(115,3,'Lista General 2025','Voluntario','MAT 26-35',475730.00,1),
(117,1,'Lista General 2025','Voluntario','MAT 36-40',292570.08,1),
(119,3,'Lista General 2025','Voluntario','MAT 36-40',597681.72,1),
(121,1,'Lista General 2025','Voluntario','MAT 41-50',304170.00,1),
(123,3,'Lista General 2025','Voluntario','MAT 41-50',653245.73,1),
(125,1,'Lista General 2025','Voluntario','MAT 51-60',454639.35,1),
(127,3,'Lista General 2025','Voluntario','MAT 51-60',935924.58,1),
(129,1,'Lista General 2025','Voluntario','MAT 61-65',788424.32,1),
(131,3,'Lista General 2025','Voluntario','MAT 61-65',1427214.56,1),
(133,1,'Lista General 2025','Voluntario','MAT 66-00',788452.91,1),
(135,3,'Lista General 2025','Voluntario','MAT 66-00',1427214.56,1),
(137,1,'Lista General 2025','Voluntario','HIJO 0-1(*)',73543.25,1),
(139,3,'Lista General 2025','Voluntario','HIJO 0-1(*)',135903.45,1),
(141,1,'Lista General 2025','Voluntario','HIJO 2-20',58833.48,1),
(143,3,'Lista General 2025','Voluntario','HIJO 2-20',88337.49,1),
(145,1,'Lista General 2025','Voluntario','HIJO 21-29',145240.77,1),
(147,3,'Lista General 2025','Voluntario','HIJO 21-29',262909.11,1),
(149,1,'Lista General 2025','Voluntario','HIJO 30-39',161690.00,1),
(151,3,'Lista General 2025','Voluntario','HIJO 30-39',330299.00,1),
(153,1,'Lista General 2025','Voluntario','HIJO 40-49',168100.00,1),
(155,3,'Lista General 2025','Voluntario','HIJO 40-49',361000.00,1),
(157,1,'Lista General 2025','Voluntario','FAMILIAR A CARGO',435720.00,1),
(159,3,'Lista General 2025','Voluntario','FAMILIAR A CARGO',788725.38,1),
(161,1,'Obligatorio','monotributo','0-17',11550.00,1),
(162,1,'Obligatorio','monotributo','18-25',15400.00,1);
UNLOCK TABLES;

/* 4. Usuario Administrador (Según [35-1037]) */
/*
   Legajo: admin
   Clave:  admin2025*
   Hash:   $2a$10$tJ.AunYJG.D.E.d8tT.Yp.1DkS/Y.xY/7g.M.t.D/A8r.tS.tW.Kq
*/
LOCK TABLES `empleados` WRITE;
INSERT INTO `empleados` (legajo, nombre, apellido, email, password, rol, estado, email_confirmado, fecha_creacion) VALUES
('admin', 'Admin', 'SIGEC', 'admin@sigec.com', '$2a$10$tJ.AunYJG.D.E.d8tT.Yp.1DkS/Y.xY/7g.M.t.D/A8r.tS.tW.Kq', 'admin', 'activo', 1, NOW());
UNLOCK TABLES;