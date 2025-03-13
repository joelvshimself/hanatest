README - Proyecto CRUD con SAP HANA

Descripción General
-------------------
Este proyecto es un CRUD (Create, Read, Update, Delete) que utiliza:
1. Un servidor Node.js con Express para exponer endpoints (API REST).
2. Una base de datos SAP HANA a la que se conecta a través de un endpoint específico.

Tecnologías Usadas
------------------
- Node.js (v14 o superior recomendado)
- Express.js (Framework web para Node.js)
- SAP HANA Client (@sap/hana-client)
- Morgan (Logs HTTP)
- Express-Status-Monitor (Monitoreo del estado de la aplicación)
- Swagger (Documentación de la API)
- Cors (Manejo de CORS)

Estructura de Archivos
----------------------
1. server.js (o el nombre que hayas elegido): 
   - Configura Express, Morgan, cors y el enrutamiento general.
   - Inicia el servidor en el puerto 5030 (configurable).
   - Configura la conexión a SAP HANA.

2. controllers/usercontroller.js:
   - Contiene las funciones que manejan la lógica de las rutas CRUD (GET, POST, PUT, DELETE) y la ruta de login.
   - Utiliza la conexión a SAP HANA para ejecutar queries.

3. .env:
   - Contiene la configuración sensible (HOST, PORT, USER, PASSWORD) para la conexión a la base de datos SAP HANA.
   - Debe ser agregado a .gitignore para no exponer credenciales.

4. package.json:
   - Lista las dependencias del proyecto.

Instalación y Uso
-----------------
1. Clonar el repositorio o descomprimir los archivos del proyecto en tu entorno local.
2. Entrar a la carpeta raíz del proyecto y ejecutar:
   npm install
3. Configurar tu archivo .env con las variables necesarias:
   HANA_HOST=...
   HANA_PORT=...
   HANA_USER=...
   HANA_PASSWORD=...
4. Iniciar el servidor:
   npm start
5. Visitar la ruta de documentación Swagger:
   http://localhost:5030/api-docs
   (Ajusta el puerto si usas otro distinto de 5030)

Importante: Instancia SAP HANA
------------------------------
La instancia de SAP HANA se apaga cada día a la medianoche. Para poder probar la aplicación en un día y hora específicos, **deben avisarme con antelación**, de modo que encienda manualmente la instancia de SAP HANA antes de las pruebas. Si la instancia no está encendida, las consultas a la base de datos fallarán y el API no funcionará correctamente.

Rutas Principales
-----------------
1. GET /users
   - Retorna todos los usuarios almacenados.
2. POST /users
   - Crea un nuevo usuario. Requiere parámetros en el body: { name, email, passwordhash }.
3. PUT /users/:id
   - Actualiza el usuario con ID indicado. Requiere parámetros en el body: { name, email, passwordhash }.
4. DELETE /users/:id
   - Elimina el usuario con ID indicado.
5. POST /login
   - Verifica las credenciales (email y passwordhash). Devuelve un mensaje de éxito o credenciales inválidas.

License
-------
Este proyecto se distribuye bajo los términos que prefieras (MIT, ISC, etc.) o bien, puedes indicar que es un repositorio privado o confidencial si así lo requieres.
prueba
