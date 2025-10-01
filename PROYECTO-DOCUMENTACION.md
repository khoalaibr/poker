Documentación del Proyecto
Este documento registra las decisiones de arquitectura, comandos y soluciones a problemas encontrados durante el desarrollo de la aplicación.

Fase 1: Configuración Inicial del Proyecto
1.1 Creación del Proyecto
Se inicia el proyecto utilizando Vite con la plantilla de React y TypeScript. Vite se elige por su rendimiento superior en el entorno de desarrollo, gracias a su servidor de desarrollo nativo de ESM y HMR (Hot Module Replacement) extremadamente rápido.

Comando de Creación:

npm create vite@latest nombre-de-tu-proyecto -- --template react-ts
cd nombre-de-tu-proyecto

1.2 Instalación de Dependencias
Se instalan las librerías fundamentales para el desarrollo de la aplicación, separando las dependencias de desarrollo (-D) de las de producción.

Comandos de Instalación:

Estilos (Dev):

npm install -D tailwindcss@3.4.1 postcss autoprefixer

Librerías Principales (Prod):

npm install react-router-dom @reduxjs/toolkit react-redux axios @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome clsx tailwind-merge

Justificación de Librerías:

Tailwind CSS: Framework CSS utility-first para estilizado rápido y consistente. Se fija la versión 3.4.1 por estabilidad.

React Router DOM: Para la gestión de rutas y navegación en la aplicación.

Redux Toolkit & React-Redux: Para una gestión de estado global predecible y escalable.

Axios: Cliente HTTP para la comunicación con APIs.

Font Awesome: Biblioteca de iconos SVG.

clsx & tailwind-merge: Utilidades para la gestión dinámica y sin conflictos de clases CSS.

1.3 Configuración de Tailwind CSS
Se inicializa y configura Tailwind CSS para que funcione correctamente con Vite.

Comandos de Inicialización:

npx tailwindcss init -p

Este comando crea los archivos tailwind.config.js y postcss.config.js.

Configuración de tailwind.config.js:
El archivo se modifica para indicar a Tailwind qué archivos debe escanear en busca de clases de utilidad, utilizando la sintaxis de ES Modules para ser compatible con Vite.

Configuración de src/index.css:
Se reemplaza el contenido del archivo CSS principal con las directivas de Tailwind para inyectar sus estilos base, de componentes y utilidades.

Fase 2: Arquitectura y Estructura de Carpetas
2.1 Definición de la Estructura
Se adopta una arquitectura de carpetas escalable y basada en responsabilidades para organizar el código fuente de manera clara y mantenible.

src/assets: Archivos estáticos (imágenes, fuentes).

src/components: Componentes de React, subdivididos en:

/ui: Componentes atómicos y reutilizables (Button, Input).

/layout: Componentes de estructura de página (Header, Footer).

/features: Componentes complejos ligados a una funcionalidad (LoginForm).

src/features: Lógica de negocio (estado de Redux, llamadas API, hooks específicos).

src/hooks: Hooks de React personalizados y reutilizables.

src/lib: Funciones de utilidad genéricas.

src/pages: Componentes que representan una página/ruta completa.

src/routes: Configuración del enrutador de la aplicación.

src/store: Configuración del store global de Redux.

Comando de Creación de Carpetas:

mkdir -p src/assets src/components/ui src/components/layout src/components/features src/features src/hooks src/lib src/pages src/routes src/store



COMANDOS PARA REVERTIR EN github

git log --oneline

Busco id

git checkout c7d8e9f .