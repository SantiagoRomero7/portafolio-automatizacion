export type Case = {
  id: string
  title: string
  problem: string
  manual: string
  build: string[]
  detail: string
  numbers: { value: string; label: string }[]
}

export const cases: Case[] = [
  {
    id: "consolidador-compras",
    title: "Una semana de compras, en quince segundos.",
    problem:
      "Cada ciclo, Abastecimiento recibía decenas de libros de compras con formatos distintos. Había que consolidarlos, separarlos por categoría y preparar los archivos para crear las órdenes de compra.",
    manual:
      "Copiar, pegar, filtrar y volver a formatear libro por libro. Cerca de una semana de trabajo cada vez, con el riesgo de que una fila se quedara por fuera.",
    build: [
      "Lectura de todos los libros de una carpeta, sin importar su formato de origen.",
      "Normalización de columnas y clasificación por categoría.",
      "Un maestro con tablas formateadas y los planos .txt que el sistema necesita para las órdenes.",
      "Empaquetado como .exe: el área lo usa sin instalar Python.",
    ],
    detail:
      "Lo más difícil no fue el código, fue la conversación: entender qué columna significa qué para cada proveedor antes de escribir una sola regla.",
    numbers: [
      { value: "~1 semana", label: "antes, por ciclo" },
      { value: "15 s", label: "después" },
      { value: "1 clic", label: "para el área" },
    ],
  },
  {
    id: "validador-afiliados",
    title: "Un millón de filas y ninguna revisión a mano.",
    problem:
      "Las bases de afiliados que llegaban para depurar había que cruzarlas contra la maestra de personas: más de un millón de registros. El cruce se hacía registro por registro.",
    manual:
      "Dos o tres días buscando cada documento en la maestra y comparando nombre, fecha de nacimiento, sexo y tipo de documento a ojo.",
    build: [
      "Diagnóstico por campo: cada registro queda como existe, existe con errores o no existe, y dice cuál es el error.",
      "Corrección del tipo de documento por reglas de edad, aplicada directamente sobre la maestra.",
      "Respaldo automático de la maestra antes de tocar un solo dato.",
    ],
    detail:
      "Con este volumen Excel no alcanza por sí solo: la lectura se hace en Python y solo la escritura final pasa por Excel, para que el archivo conserve su formato.",
    numbers: [
      { value: "~1 M", label: "registros en la maestra" },
      { value: "27.068", label: "registros diagnosticados en un solo archivo" },
      { value: "122.434", label: "correcciones aplicadas" },
      { value: "0", label: "inconsistencias restantes" },
    ],
  },
  {
    id: "convertidor-pdf",
    title: "887 páginas de PDF, convertidas en tablas.",
    problem:
      "Los listados y anexos tributarios llegan en PDF de cientos de páginas. Para trabajarlos había que pasarlos a Excel, y en las páginas escaneadas ni siquiera se podía copiar el texto.",
    manual: "Horas copiando, pegando y rearmando columnas que el PDF desordenaba.",
    build: [
      "Extracción de la capa de texto con PyMuPDF cuando existe.",
      "OCR con Tesseract para las páginas que son imagen.",
      "Reconstrucción de la cuadrícula de la tabla a partir de las coordenadas de cada palabra.",
    ],
    detail:
      "Probé varios modos de segmentación de página del OCR, uno por uno, hasta dar con los que respetaban las columnas. La tabla se arma por posición, no por el orden del texto.",
    numbers: [
      { value: "887", label: "páginas en una corrida" },
      { value: "~15 min", label: "de principio a fin" },
      { value: "2", label: "motores: texto + OCR" },
    ],
  },
  {
    id: "validacion-fumigacion",
    title: "24 sedes, cinco documentos, una sola revisión.",
    problem:
      "Cada mes, Infraestructura valida la facturación del servicio de fumigación: informe, cronograma, certificados, planillas firmadas y la factura tienen que coincidir para las 24 sedes.",
    manual: "Revisar sede por sede, abrir cada certificado y cada planilla escaneada, y cuadrar el total con la factura: 3 a 4 horas.",
    build: [
      "Cruce de las cinco fuentes contra el listado de sedes.",
      "OCR (easyocr + Tesseract) para leer las planillas escaneadas.",
      "Verificación del cuadre total, carpetas organizadas por sede y registro concentrador por áreas.",
      "Interfaz en PySide6 con hoja de control.",
    ],
    detail:
      "El OCR es lo lento, así que cada página leída se guarda en caché. La primera corrida toma unos 15 minutos y las siguientes unos 2.",
    numbers: [
      { value: "24", label: "sedes por corrida" },
      { value: "5", label: "fuentes cruzadas" },
      { value: "15 → 2 min", label: "gracias a la caché" },
    ],
  },
  {
    id: "actualizador-mensual",
    title: "Cuando Excel no coopera, negocio con su XML.",
    problem:
      "Cada mes alguien abría decenas de libros con tablas dinámicas conectadas a la base contable, cambiaba el filtro de período y esperaba el refresco.",
    manual: "Entre 4 y 5 horas frente a la pantalla, libro por libro, sin poder hacer otra cosa.",
    build: [
      "Selección de meses y carga de archivos o carpetas completas.",
      "Detección automática de los campos de período y mes dentro de cada libro.",
      "Autenticación de la conexión resuelta sin que el usuario escriba nada.",
      "Registro en vivo de cada operación y botón para detener.",
    ],
    detail:
      "Tres estrategias en cascada. Primero la vía rápida por COM; si falla, ítem por ítem; y como último recurso, abrir el .xlsx como el ZIP que es y editar su XML directamente.",
    numbers: [
      { value: "3", label: "estrategias de respaldo" },
      { value: "0 min", label: "de atención humana" },
      { value: "12", label: "meses por corrida" },
    ],
  },
]
