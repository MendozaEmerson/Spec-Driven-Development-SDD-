# Implementation Plan: Weather Forecast App

## Overview

Implementación de una SPA (Single-Page Application) en HTML, CSS y JavaScript vanilla que permite consultar el pronóstico del clima de cualquier ciudad usando las APIs públicas de Open-Meteo. La aplicación se estructura en cinco módulos (`validation.js`, `geocodingService.js`, `weatherService.js`, `ui.js`, `app.js`) con pruebas unitarias en Vitest y pruebas basadas en propiedades con fast-check.

## Tasks

- [x] 1. Scaffolding del proyecto: estructura de archivos y configuración del entorno de testing
  - Crear la estructura de directorios: `src/`, `src/tests/`, `public/`
  - Crear `index.html` con el formulario de entrada, el área de resultados, el área de errores y el spinner de carga
  - Crear `package.json` con scripts `test` y `test:run`, y agregar dependencias de desarrollo `vitest` y `fast-check`
  - Crear `vitest.config.js` con entorno `jsdom` para permitir manipulación del DOM en tests
  - Crear archivos vacíos `src/validation.js`, `src/geocodingService.js`, `src/weatherService.js`, `src/ui.js`, `src/app.js`
  - _Requirements: 1.1_

- [x] 2. Implementar módulo de validación
  - [x] 2.1 Implementar `validation.js` con la función `validateCityName(raw)`
    - Aplicar `trim()` al input antes de validar
    - Retornar `{ valid: false, error: '...' }` para vacío/solo espacios (código `EMPTY_CITY`)
    - Retornar `{ valid: false, error: '...' }` para longitud > 100 (código `CITY_TOO_LONG`)
    - Retornar `{ valid: false, error: '...' }` para caracteres que no sean letras Unicode, espacios, guiones o apóstrofes (código `INVALID_CHARS`)
    - Retornar `{ valid: true }` para entradas que pasen todas las reglas
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 2.2 Escribir pruebas unitarias para `validateCityName`
    - Casos: nombre válido, vacío, solo espacios, caracteres especiales conocidos, longitud exactamente 100 vs 101
    - Casos borde: `null`, `undefined`, string con solo guiones/apóstrofes
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 2.3 Escribir prueba de propiedad para validación — Property 1
    - **Property 1: Nombres compuestos solo de espacios en blanco son rechazados**
    - Generador: `fc.stringOf(fc.char().filter(c => /\s/.test(c)), {minLength: 1})`
    - Verificar que `validateCityName` retorna `{ valid: false }` para toda cadena con solo whitespace
    - **Validates: Requirements 1.2, 1.3**

  - [x] 2.4 Escribir prueba de propiedad para validación — Property 2
    - **Property 2: El trim no cambia la validez de entradas válidas**
    - Generador: nombres válidos conocidos + padding con espacios al inicio/final
    - Verificar que el resultado de validación es idéntico con o sin espacios de relleno
    - **Validates: Requirements 1.4**

  - [x] 2.5 Escribir prueba de propiedad para validación — Property 3
    - **Property 3: Caracteres inválidos en el nombre producen error de validación**
    - Generador: `fc.string()` con al menos un carácter prohibido inyectado (no letra/espacio/guion/apóstrofe)
    - Verificar que `validateCityName` retorna `{ valid: false }`
    - **Validates: Requirements 1.6**

  - [x] 2.6 Escribir prueba de propiedad para validación — Property 4
    - **Property 4: Nombres que superan los 100 caracteres son rechazados**
    - Generador: `fc.string({ minLength: 101 })` compuesto por caracteres válidos
    - Verificar que `validateCityName` retorna `{ valid: false }`
    - **Validates: Requirements 1.5**

- [x] 3. Checkpoint — Verificar módulo de validación
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implementar módulo de geocodificación
  - [x] 4.1 Implementar `geocodingService.js` con la función `geocodeCity(cityName)`
    - Construir URL: `https://geocoding-api.open-meteo.com/v1/search?name={encoded}&count=1&language=es&format=json`
    - Implementar timeout de 10 s con `AbortController` + `setTimeout`
    - Retornar `{ ok: true, data: { name, latitude, longitude } }` usando el índice 0 de `results[]`
    - Retornar `{ ok: false, error: 'not_found' }` si `results` está vacío o ausente y la respuesta es HTTP 200
    - Retornar `{ ok: false, error: 'unavailable' }` en error de red, timeout o respuesta HTTP de error
    - Retornar `{ ok: false, error: 'invalid_response' }` si la estructura de respuesta no es la esperada
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7_

  - [x] 4.2 Escribir pruebas unitarias para `geocodingService`
    - Usar `vi.stubGlobal('fetch', ...)` para mockear `fetch`
    - Casos: respuesta exitosa con 1+ resultados, cero resultados, timeout, error HTTP, respuesta malformada
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7_

  - [x] 4.3 Escribir prueba de propiedad para geocodificación — Property 5
    - **Property 5: La geocodificación siempre usa el primer resultado**
    - Generador: `fc.array(fc.record({name: fc.string(), latitude: fc.float(), longitude: fc.float()}), {minLength: 1})`
    - Mockear fetch para retornar `{ results: generatedArray }`
    - Verificar que `geocodeCity` extrae exclusivamente el elemento en índice 0
    - **Validates: Requirements 2.2**

  - [x] 4.4 Escribir prueba de propiedad para geocodificación — Property 6
    - **Property 6: Respuestas malformadas de la Geocoding API producen error `invalid_response`**
    - Generador: `fc.object()` que no cumple el esquema esperado (sin `results` array o sin campos requeridos en el primer elemento)
    - Verificar que `geocodeCity` retorna `{ ok: false, error: 'invalid_response' }`
    - **Validates: Requirements 2.7**

- [x] 5. Implementar módulo de servicio meteorológico
  - [x] 5.1 Implementar `weatherService.js` con la función `fetchWeather(lat, lon)`
    - Construir URL: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation`
    - Implementar timeout de 10 s con `AbortController` + `setTimeout`
    - Extraer `current.temperature_2m`, `current.relative_humidity_2m`, `current.precipitation`
    - Retornar `{ ok: true, data: { temperature, relativeHumidity, precipitation } }` con valores numéricos sin transformación
    - Retornar `{ ok: false, error: 'unavailable' }` en error de red, timeout o HTTP error
    - Retornar `{ ok: false, error: 'invalid_data' }` si alguno de los tres campos está ausente, es `null` o no es numérico
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.2 Escribir pruebas unitarias para `weatherService`
    - Usar `vi.stubGlobal('fetch', ...)` para mockear `fetch`
    - Casos: respuesta exitosa, timeout, error HTTP, campos `null`, campos `undefined`, campos con valor `NaN`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.3 Escribir prueba de propiedad para servicio meteorológico — Property 7
    - **Property 7: El servicio de clima incluye las coordenadas y variables requeridas en la URL**
    - Generador: `fc.tuple(fc.float({min:-90,max:90}), fc.float({min:-180,max:180}))`
    - Inspeccionar la URL construida para verificar que contiene `latitude`, `longitude` y los tres parámetros `current`
    - **Validates: Requirements 3.1**

  - [x] 5.4 Escribir prueba de propiedad para servicio meteorológico — Property 8
    - **Property 8: Los datos meteorológicos se extraen con fidelidad exacta**
    - Generador: `fc.record({temperature_2m: fc.float(), relative_humidity_2m: fc.float(), precipitation: fc.float()})`
    - Mockear fetch con esos valores y verificar que `fetchWeather` los retorna sin transformación
    - **Validates: Requirements 3.2**

  - [x] 5.5 Escribir prueba de propiedad para servicio meteorológico — Property 9
    - **Property 9: Respuestas con campos faltantes o no-numéricos producen `invalid_data`**
    - Generador: objetos con ≥1 campo requerido ausente, `null` o no-numérico
    - Verificar que `fetchWeather` retorna `{ ok: false, error: 'invalid_data' }`
    - **Validates: Requirements 3.5**

- [x] 6. Checkpoint — Verificar servicios de API
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implementar módulo de UI
  - [x] 7.1 Implementar `ui.js` con las funciones del componente UI
    - `getCityInput()`: lee y retorna el valor del campo de texto
    - `showLoading()`: muestra el spinner y deshabilita el botón de envío
    - `hideLoading()`: oculta el spinner y habilita el botón de envío
    - `showResults(data)`: renderiza `cityName`, `temperature °C`, `relativeHumidity %`, `precipitation mm` en el panel de resultados y oculta el panel de error; reemplaza cualquier contenido previo
    - `showError(message)`: muestra el mensaje en el panel de error (máx. 200 chars) y oculta el panel de resultados
    - `clearResults()`: limpia el panel de resultados y el panel de error
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 7.2 Escribir pruebas unitarias para `ui.js`
    - Configurar DOM virtual con `jsdom` en Vitest
    - Casos: `showResults` renderiza todos los campos con unidades, `showError` trunca a 200 chars, `showLoading`/`hideLoading` alternan visibilidad correctamente
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 7.3 Escribir prueba de propiedad para UI — Property 10
    - **Property 10: Los resultados mostrados incluyen todos los campos con sus unidades**
    - Generador: `fc.record({cityName: fc.string(), temperature: fc.float(), relativeHumidity: fc.float(), precipitation: fc.float()})`
    - Verificar que el DOM contiene `°C`, `%` y `mm` adyacentes a los valores numéricos
    - **Validates: Requirements 4.1, 4.3**

  - [x] 7.4 Escribir prueba de propiedad para UI — Property 11
    - **Property 11: Nuevos resultados reemplazan completamente el estado anterior**
    - Generador: dos `WeatherResult` aleatorios consecutivos
    - Verificar que tras el segundo `showResults` no hay rastro del primer resultado en el DOM
    - **Validates: Requirements 4.2**

  - [x] 7.5 Escribir prueba de propiedad para UI — Property 12
    - **Property 12: Los valores numéricos mostrados son fieles a los recibidos de la API**
    - Generador: `fc.float({ noNaN: true })` para temperatura, humedad y precipitación
    - Verificar que el valor parseado del DOM difiere del original en menos de `0.005`
    - **Validates: Requirements 5.1**

  - [x] 7.6 Escribir prueba de propiedad para UI — Property 13
    - **Property 13: El nombre de ciudad se muestra exactamente como lo devuelve la API**
    - Generador: `fc.string()` con caracteres Unicode y diacríticos
    - Verificar que el DOM muestra exactamente la cadena recibida sin ninguna transformación
    - **Validates: Requirements 5.2**

- [x] 8. Implementar controlador principal
  - [x] 8.1 Implementar `app.js` con la función `handleSubmit(event)` y registrar el listener del formulario
    - Llamar a `validateCityName`; si inválido, llamar a `showError` y retornar
    - Llamar a `showLoading()` antes de cualquier petición de red
    - Llamar a `geocodeCity`; si falla, llamar a `hideLoading()` + `showError` y retornar
    - Llamar a `fetchWeather` con las coordenadas obtenidas; si falla, llamar a `hideLoading()` + `showError` y retornar
    - En éxito, llamar a `hideLoading()` + `showResults` con los datos combinados
    - Garantizar que `hideLoading()` se ejecuta siempre en el bloque `finally`
    - No implementar caché: cada submit siempre realiza nuevas peticiones de red
    - _Requirements: 2.5, 3.6, 4.1, 4.4, 5.3_

  - [x] 8.2 Escribir pruebas unitarias para `app.js`
    - Mockear `validation`, `geocodingService`, `weatherService` y `ui`
    - Verificar que el spinner aparece antes de las peticiones y desaparece tras ellas
    - Verificar que los módulos se invocan en el orden correcto
    - Verificar que un error en geocoding impide la llamada a weatherService
    - _Requirements: 2.5, 3.6, 4.4, 5.3_

  - [x] 8.3 Escribir prueba de propiedad para el controlador — Property 14
    - **Property 14: Envíos repetidos siempre generan nuevas peticiones de red**
    - Generador: cualquier nombre de ciudad válido, submitado dos veces consecutivas
    - Mockear `fetch` global y contar las llamadas; verificar que se realizan exactamente 2 llamadas a la Weather API
    - **Validates: Requirements 5.3**

  - [x] 8.4 Verificar Property 15: todos los mensajes de error tienen ≤ 200 caracteres
    - **Property 15: Todos los mensajes de error tienen como máximo 200 caracteres**
    - Iterar sobre todos los códigos de error definidos en los módulos (`EMPTY_CITY`, `CITY_TOO_LONG`, `INVALID_CHARS`, `CITY_NOT_FOUND`, `GEO_UNAVAILABLE`, `GEO_INVALID_RESPONSE`, `WEATHER_UNAVAILABLE`, `WEATHER_INVALID_DATA`)
    - Verificar que cada mensaje tiene longitud ≤ 200
    - **Validates: Requirements 4.4**

- [x] 9. Checkpoint — Verificar integración del controlador y cobertura completa
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Estilos CSS y pulido final de la UI
  - [x] 10.1 Crear `src/styles.css` con estilos base
    - Estilos para el formulario: campo de texto, botón de envío, mensajes de validación
    - Estilos para el spinner de carga (animación CSS)
    - Estilos para el panel de resultados: tarjeta con nombre de ciudad y los tres valores meteorológicos con sus unidades
    - Estilos para el panel de error: mensaje destacado visualmente
    - Layout responsivo básico centrado
    - _Requirements: 1.1, 4.1, 4.3, 4.4_

  - [x] 10.2 Vincular `styles.css` en `index.html` y verificar que los selectores CSS corresponden a los IDs/clases usados en `ui.js`
    - Asegurar que el spinner, el panel de resultados y el panel de error tienen los IDs correctos
    - Verificar accesibilidad básica: etiquetas `<label>` asociadas al input, atributo `aria-live` en el área de errores
    - _Requirements: 1.1, 4.1, 4.4_

- [x] 11. Checkpoint final — Verificar aplicación completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints garantizan validación incremental antes de pasar al siguiente módulo
- Las pruebas de propiedad validan características universales con fast-check (mínimo 100 iteraciones por propiedad)
- Las pruebas unitarias validan ejemplos concretos y casos borde
- Para ejecutar las pruebas en modo único (no watch): `npm run test:run`
- Para ejecutar en modo watch durante desarrollo: `npm test`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "5.4", "5.5"] },
    { "id": 6, "tasks": ["7.1"] },
    { "id": 7, "tasks": ["7.2", "7.3", "7.4", "7.5", "7.6", "8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3", "8.4"] },
    { "id": 9, "tasks": ["10.1"] },
    { "id": 10, "tasks": ["10.2"] }
  ]
}
```
