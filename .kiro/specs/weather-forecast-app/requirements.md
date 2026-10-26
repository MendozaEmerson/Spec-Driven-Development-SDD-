# Requirements Document

## Introduction

Esta aplicación web permite a los usuarios obtener el pronóstico del clima de cualquier ciudad del mundo. El usuario ingresa el nombre de una ciudad, la aplicación convierte ese nombre en coordenadas geográficas usando la API de geocodificación de Open-Meteo, luego consulta el pronóstico meteorológico (temperatura, humedad y precipitaciones) con esas coordenadas, y finalmente muestra los resultados en la interfaz web.

## Glossary

- **App**: La aplicación web de pronóstico del clima.
- **Usuario**: La persona que interactúa con la interfaz web de la App.
- **Geocoding_API**: El endpoint de geocodificación de Open-Meteo (`https://geocoding-api.open-meteo.com/v1/search`) que convierte nombres de ciudades en coordenadas geográficas.
- **Weather_API**: El endpoint de pronóstico de Open-Meteo (`https://api.open-meteo.com/v1/forecast`) que devuelve datos meteorológicos dado un par de coordenadas.
- **Nombre_Ciudad**: El texto ingresado por el Usuario para identificar una ciudad.
- **Coordenadas**: El par latitud/longitud devuelto por la Geocoding_API para una ciudad.
- **Pronóstico**: El conjunto de datos meteorológicos (temperatura, humedad y precipitaciones) devuelto por la Weather_API.
- **UI**: La interfaz de usuario renderizada en el navegador web.

---

## Requirements

### Requirement 1: Entrada del nombre de ciudad

**User Story:** Como Usuario, quiero escribir el nombre de una ciudad en un campo de texto y enviarlo, para poder solicitar el pronóstico del clima de esa ubicación.

#### Acceptance Criteria

1. WHEN la página carga, THE App SHALL mostrar un campo de entrada de texto y un botón de envío en la UI.
2. IF el Usuario envía un Nombre_Ciudad vacío, THEN THE App SHALL mostrar un mensaje de validación indicando que el nombre de ciudad es requerido.
3. IF el Usuario envía un Nombre_Ciudad que contiene solo espacios en blanco, THEN THE App SHALL mostrar un mensaje de validación indicando que el nombre de ciudad es requerido.
4. WHEN el Usuario envía un Nombre_Ciudad válido, THE App SHALL eliminar los espacios en blanco al inicio y al final antes de procesar la solicitud.
5. IF el Usuario envía un Nombre_Ciudad que supera los 100 caracteres, THEN THE App SHALL mostrar un mensaje de validación indicando que el nombre de ciudad no debe superar los 100 caracteres y SHALL NOT procesar la solicitud.
6. IF el Usuario envía un Nombre_Ciudad que contiene caracteres distintos a letras, espacios, guiones o apóstrofes, THEN THE App SHALL mostrar un mensaje de validación indicando que el nombre de ciudad contiene caracteres inválidos y SHALL NOT procesar la solicitud.

---

### Requirement 2: Geocodificación del nombre de ciudad

**User Story:** Como Usuario, quiero que la aplicación encuentre automáticamente las coordenadas geográficas de la ciudad que ingresé, para no tener que buscar la latitud y longitud manualmente.

#### Acceptance Criteria

1. WHEN el Usuario envía un Nombre_Ciudad que contiene entre 1 y 100 caracteres compuestos por letras, espacios, guiones o puntos, THE App SHALL enviar una solicitud a la Geocoding_API con el Nombre_Ciudad como parámetro de búsqueda.
2. WHEN la Geocoding_API devuelve uno o más resultados, THE App SHALL usar las Coordenadas del primer resultado (coincidencia de mayor relevancia) para la consulta del pronóstico.
3. IF la Geocoding_API devuelve cero resultados para el Nombre_Ciudad dado, THEN THE App SHALL mostrar un mensaje de error indicando que la ciudad no fue encontrada.
4. IF la solicitud a la Geocoding_API no se completa dentro de 10 segundos o devuelve una respuesta de error, THEN THE App SHALL mostrar un mensaje de error indicando que el servicio de geocodificación no está disponible.
5. WHILE una solicitud a la Geocoding_API está en progreso, THE App SHALL mostrar un indicador de carga y eliminarlo una vez que la App reciba una respuesta o la solicitud expire.
6. IF el Usuario envía un Nombre_Ciudad que está vacío, supera los 100 caracteres o contiene caracteres distintos a letras, espacios, guiones o puntos, THEN THE App SHALL mostrar un mensaje de error indicando que la entrada es inválida y SHALL NOT enviar una solicitud a la Geocoding_API.
7. IF la Geocoding_API devuelve una respuesta que no es un conjunto de resultados válido, THEN THE App SHALL mostrar un mensaje de error indicando que el servicio de geocodificación devolvió una respuesta inesperada.

---

### Requirement 3: Consulta del pronóstico del clima

**User Story:** Como Usuario, quiero que la aplicación obtenga datos de temperatura, humedad y precipitaciones para las coordenadas de la ciudad resuelta, para poder ver información meteorológica precisa.

#### Acceptance Criteria

1. WHEN se obtienen Coordenadas válidas de la Geocoding_API, THE App SHALL enviar una solicitud a la Weather_API incluyendo latitud, longitud y solicitando valores actuales de temperatura (°C), humedad relativa (%) y precipitaciones (mm).
2. WHEN la Weather_API devuelve una respuesta exitosa, THE App SHALL extraer la temperatura actual en grados Celsius, la humedad relativa en porcentaje y las precipitaciones en milímetros del payload de la respuesta.
3. IF la solicitud a la Weather_API no recibe respuesta dentro de 10 segundos, THEN THE App SHALL cancelar la solicitud y mostrar un mensaje de error indicando que el servicio meteorológico no está disponible.
4. IF la Weather_API devuelve un estado HTTP de error o un fallo de conexión a nivel de red, THEN THE App SHALL mostrar un mensaje de error indicando que el servicio meteorológico no está disponible.
5. IF la Weather_API devuelve una respuesta en la que uno o más de los campos de temperatura, humedad o precipitaciones están ausentes o contienen un valor no numérico, THEN THE App SHALL mostrar un mensaje de error indicando que los datos meteorológicos no pudieron ser procesados.
6. WHILE una solicitud a la Weather_API está en progreso, THE App SHALL mostrar un indicador de carga en la UI.

---

### Requirement 4: Visualización de resultados

**User Story:** Como Usuario, quiero ver los resultados del pronóstico del clima claramente presentados en la interfaz, para poder entender rápidamente las condiciones actuales de la ciudad que busqué.

#### Acceptance Criteria

1. WHEN un Pronóstico es recuperado exitosamente, THE App SHALL mostrar el nombre de la ciudad resuelta, la temperatura actual en grados Celsius, la humedad relativa en porcentaje y las precipitaciones en milímetros en la UI, cada uno como un elemento visible en el área de resultados.
2. WHEN un Pronóstico es recuperado exitosamente, THE App SHALL reemplazar cualquier Pronóstico o mensaje de error mostrado anteriormente con los nuevos resultados.
3. THE App SHALL etiquetar cada valor meteorológico mostrado con su unidad correspondiente (°C para temperatura, % para humedad, mm para precipitaciones) adyacente al valor numérico.
4. WHEN ocurre un error durante la geocodificación o la obtención del pronóstico, THE App SHALL mostrar un mensaje de error de no más de 200 caracteres describiendo el motivo del fallo en la UI y ocultará cualquier dato de Pronóstico mostrado anteriormente.

---

### Requirement 5: Propiedad de consistencia de datos (round-trip y completitud)

**User Story:** Como Usuario, quiero que los datos mostrados en pantalla representen fielmente lo que devolvieron las APIs, para poder confiar en la información presentada.

#### Acceptance Criteria

1. FOR ALL respuestas de Pronóstico exitosas, THE App SHALL mostrar los valores de temperatura, humedad y precipitaciones que sean numéricamente iguales a los valores recibidos de la Weather_API, donde las únicas transformaciones permitidas son truncamiento o redondeo a máximo 2 decimales con fines de visualización.
2. THE App SHALL NOT alterar el nombre de ciudad devuelto por la Geocoding_API al mostrarlo; THE App SHALL mostrar el nombre de ciudad exactamente como fue proporcionado en la respuesta de la API, incluyendo las mayúsculas originales y los signos diacríticos.
3. FOR ALL entradas de Nombre_Ciudad que producen un Pronóstico válido, enviar el mismo Nombre_Ciudad por segunda vez SHALL causar que la App realice una nueva solicitud de red a la Weather_API y muestre los valores de esa nueva respuesta.
