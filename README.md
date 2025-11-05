# Proyecto SIGEC - Backend

Sistema de Gestión de Cotizaciones (SIGEC) es una aplicación full-stack diseñada para optimizar el proceso de venta de planes de salud para asesores comerciales.

Este repositorio contiene el **backend** de la aplicación, que incluye:

* Una **API RESTful** completa construida con Node.js y Express.
* Autenticación y autorización (Asesores, Supervisores, Admin) usando **JWT** (JSON Web Tokens).
* Gestión completa (CRUD) de Clientes, Planes y Empleados.
* Un **motor de cálculo** dinámico para cotizaciones.
* Generación de documentos **PDF** de cotización sobre la marcha.
* Documentación de API interactiva y automatizada con **Swagger**.
* **Una suite de 10 pruebas de integración (testing) automatizadas con Jest y Supertest.**

---

## Documentación de la API (Swagger)

Toda la documentación interactiva de la API, donde se pueden probar todos los endpoints, se encuentra disponible una vez que el servidor está en funcionamiento.

**Para ver la documentación:**

1.  Inicia el servidor:
    ```bash
    npm run dev
    ```
2.  Abre la siguiente URL en tu navegador:
    [**http://localhost:5000/api/docs**](http://localhost:5000/api/docs)

---

## Diagrama de la Base de Datos (DER)

Este es el Diagrama de Entidad-Relación que muestra la estructura de la base de datos de SIGEC.

![Diagrama de Entidad-Relación de SIGEC](diagrama_der.png)

---

## Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/ysivira/backend-sigec](https://github.com/ysivira/backend-sigec)
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Configura tus variables de entorno:**
    * Crea un archivo `.env` en la raíz del proyecto.
    * Usa el archivo `.env.example` como plantilla para configurar tus credenciales de base de datos y `JWT_SECRET`.
    * **Importante:** Asegúrate de definir tanto `DB_NAME` (ej. `sigec_db`) como `TEST_DB_NAME` (ej. `sigec_test`).

4.  **Prepara la Base de Datos de Desarrollo:**
    * **Esta configuración es solo para correr el servidor de desarrollo (`npm run dev`).**
    * Abre tu herramienta de base de datos (DBeaver, MySQL Workbench, etc.).
    * Crea una nueva base de datos con el nombre que pusiste en `DB_NAME` en tu `.env` (ej. `sigec_db`).
    * Abre esa base de datos y **ejecuta el script `schema.sql`** (que está en la raíz del proyecto) para crear todas las tablas.

5.  **Inicia el servidor:**

    Tienes dos opciones para iniciar el servidor:

    ### Para Desarrollo (Recomendado)
    Este comando usa `nodemon` para reiniciar el servidor automáticamente cada vez que guardas un cambio en el código.

    ```bash
    npm run dev
    ```

    ### Para Producción
    Este comando ejecuta el servidor una sola vez. (Asegúrate de tener `"start": "node index.js"` en tu `package.json`).

    ```bash
    npm start
    ```

---

## **Pruebas (Testing)**

Este proyecto incluye una suite completa de 10 pruebas de integración automatizadas que validan toda la lógica de la API (Autenticación, Clientes y Cotizaciones).

Las pruebas se ejecutan contra la base de datos de prueba (definida en `TEST_DB_NAME`), la cual se **crea y destruye automáticamente** en cada ejecución. No necesitas configurar `schema.sql` para las pruebas.

**Para ejecutar todas las pruebas:**
```bash
npm test