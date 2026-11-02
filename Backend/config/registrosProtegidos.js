// Límites por ID que consultan los modelos antes de eliminar registros.
// No se consulta una marca en la base: todo ID menor o igual al límite queda protegido.
// En una base nueva hay que revisar estos valores, porque el esquema no carga datos iniciales.

// IDs cargados originalmente con el proyecto. Los registros posteriores sí se pueden eliminar.
module.exports = {
  personas: 3,
  objetos: 3,
  categorias: 11,
};
