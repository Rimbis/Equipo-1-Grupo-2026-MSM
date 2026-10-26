
CREATE TABLE IF NOT EXISTS personas (
    id        SERIAL PRIMARY KEY,
    nombre    VARCHAR(100) NOT NULL,
    apellido  VARCHAR(100) NOT NULL,
    curso     VARCHAR(50)  NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS objetos (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    categoria_id  INTEGER REFERENCES categorias(id),
    estado        VARCHAR(20) NOT NULL DEFAULT 'disponible'
                  CHECK (estado IN ('disponible', 'prestado'))
);

CREATE TABLE IF NOT EXISTS prestamos (
    id                SERIAL PRIMARY KEY,
    persona_id        INTEGER NOT NULL REFERENCES personas(id),
    objeto_id         INTEGER NOT NULL REFERENCES objetos(id),
    estado            VARCHAR(20) NOT NULL DEFAULT 'activo'
                      CHECK (estado IN ('activo', 'devuelto')),
    fecha_salida      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_devolucion  TIMESTAMPTZ
);

-- Un objeto no puede tener dos préstamos activos a la vez (refuerza lo que ya
-- controla el backend con FOR UPDATE).
CREATE UNIQUE INDEX IF NOT EXISTS prestamos_un_activo_por_objeto
    ON prestamos (objeto_id) WHERE estado = 'activo';

CREATE TABLE IF NOT EXISTS usuarios (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    usuario        VARCHAR(30)  NOT NULL UNIQUE,
    password_hash  TEXT         NOT NULL,
    rol            VARCHAR(20)  NOT NULL DEFAULT 'bibliotecario'
                   CHECK (rol IN ('admin', 'bibliotecario')),
    creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


