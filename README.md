# Proyecto SIGEC - Backend

Sistema de Gestión de Cotizaciones (SIGEC) es una aplicación full-stack diseñada para optimizar el proceso de venta de planes de salud para asesores comerciales.

Este repositorio contiene el **backend** de la aplicación, que incluye:

* Una **API RESTful** completa construida con Node.js y Express.
* Autenticación y autorización (Asesores, Supervisores, Admin) usando **JWT** (JSON Web Tokens).
* Gestión completa (CRUD) de Clientes, Planes y Empleados.
* Un **motor de cálculo** dinámico para cotizaciones, capaz de manejar múltiples descuentos, aportes de obra social y tipos de ingreso.
* Generación de documentos **PDF** de cotización sobre la marcha.
* Documentación de API interactiva y automatizada con **Swagger**.

---

## Documentación de la API (Swagger)

Toda la documentación interactiva de la API, donde se pueden probar todos los endpoints, se encuentra disponible una vez que el servidor está en funcionamiento.

**Para ver la documentation:**

1.  Inicia el servidor:
    ```bash
    npm run dev
    ```
2.  Abre la siguiente URL en tu navegador:
    [**http://localhost:5000/api/docs**](http://localhost:5000/api/docs)

---

## Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/ysivira/backend-sigec
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  Configura tus variables de entorno en un archivo `.env` (puedes usar `.env.example` como plantilla).

4.  **Prepara la Base de Datos:**
    * Abre tu herramienta de base de datos (DBeaver, MySQL Workbench, etc.).
    * Crea una nueva base de datos con el nombre que pusiste en tu `.env` (ej. `sigec_db`).
    * Abre esa base de datos y **ejecuta el script `schema.sql`** (que está en la raíz del proyecto) para crear todas las tablas.

5.  **Inicia el servidor:**

    Tienes dos opciones para iniciar el servidor:

    ### Para Desarrollo (Recomendado)
    Este comando usa `nodemon` para reiniciar el servidor automáticamente cada vez que guardas un cambio en el código.

    ```bash
    npm run dev
    ```

    ### Para Producción (o si `npm run dev` falla)
    Este comando ejecuta el servidor una sola vez. Si haces cambios en el código, tendrás que detenerlo (`Ctrl+C`) y volver a iniciarlo.

    ```bash
    node index.js
    ```