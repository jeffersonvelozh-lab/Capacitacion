
-- Se crea la base de datos de la practica del banco y cajero
CREATE SCHEMA IF NOT EXISTS BancoFuego;
SET search_path TO BancoFuego;

-- Creacion de las tablas del esquema BancoFuego
CREATE TABLE BancoFuego.Banco(

    id_banco SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    direccion VARCHAR(200),
    activo BOOLEAN DEFAULT TRUE

);


CREATE TABLE BancoFuego.Cliente(

    id_cliente SERIAL PRIMARY KEY,
    cedula VARCHAR(10) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion VARCHAR(200),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE

);


--Es un enun para el tipo de cuenta, puede ser de ahorro o corriente
CREATE TYPE tipo_cuenta AS ENUM ('AHORRO', 'CORRIENTE');
-- Se crea la tabla de cuenta 
CREATE TABLE BancoFuego.Cuenta(

    id_cuenta SERIAL PRIMARY KEY,
    numero_cuenta VARCHAR(20) NOT NULL UNIQUE,
    tipo tipo_cuenta NOT NULL, -- Se usa el enun Tipo_cuenta para definir el tipo de cuenta
    saldo NUMERIC(15,2) NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activa BOOLEAN DEFAULT TRUE,
    id_cliente INTEGER NOT NULL,
    id_banco INTEGER NOT NULL,

    CONSTRAINT chk_saldo
        CHECK(saldo >= 0),

    CONSTRAINT fk_cliente FOREIGN KEY(id_cliente) REFERENCES BancoFuego.cliente(id_cliente)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_banco FOREIGN KEY(id_banco) REFERENCES BancoFuego.banco(id_banco)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);


-- Se crea un enun para el tipo de tarjeta, puede ser de debito o credito
CREATE TYPE tipo_tarjeta AS ENUM ('DEBITO', 'CREDITO');
-- Se crea la tabla de tarjeta, que tiene una relacion con la tabla de cuenta
CREATE TABLE BancoFuego.Tarjeta(

    id_tarjeta SERIAL PRIMARY KEY,
    numero_tarjeta VARCHAR(20) UNIQUE NOT NULL,
    tipo tipo_tarjeta NOT NULL, -- Se usa el enun Tipo_tarjeta para definir el tipo de tarjeta
    fecha_vencimiento DATE NOT NULL,
    cvv VARCHAR(4) NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    id_cuenta INTEGER NOT NULL,

    CONSTRAINT fk_cuenta FOREIGN KEY(id_cuenta) REFERENCES BancoFuego.cuenta(id_cuenta)
        ON UPDATE CASCADE
        ON DELETE CASCADE

);

-- S crea la tabla de cajero, que tiene una relacion con la tabla de banco
CREATE TABLE BancoFuego.Cajero(

    id_cajero SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    ubicacion VARCHAR(250),
    activo BOOLEAN DEFAULT TRUE,
    id_banco INTEGER NOT NULL,

    CONSTRAINT fk_banco_cajero FOREIGN KEY(id_banco) REFERENCES BancoFuego.banco(id_banco)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);


-- Se crea un enun para el tipo de transaccion, puede ser deposito, retiro o transferencia
CREATE TYPE tipo_transaccion AS ENUM ('DEPOSITO', 'RETIRO', 'TRANSFERENCIA');
-- Se crea un enun para el estado de la transaccion, puede ser exitosa, fallida o cancelada
CREATE TYPE estado_transaccion AS ENUM ('EXITOSA', 'FALLIDA', 'CANCELADA');
-- Se crea la tabla de transaccion, que tiene una relacion con la tabla de cajero
CREATE TABLE BancoFuego.Transaccion(

    id_transaccion SERIAL PRIMARY KEY,
    tipo tipo_transaccion NOT NULL,
    monto NUMERIC(15,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado estado_transaccion DEFAULT 'EXITOSA',
    descripcion TEXT,
    id_cajero INTEGER,

    CONSTRAINT chk_monto CHECK(monto > 0),

    CONSTRAINT fk_cajero FOREIGN KEY(id_cajero) REFERENCES BancoFuego.cajero(id_cajero)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);

-- Se crea un enun para el tipo de movimiento, puede ser deposito, retiro o transferencia
CREATE TYPE tipo_movimiento AS ENUM ('DEPOSITO', 'RETIRO', 'TRANSFERENCIA');
-- Se crea la tabla de movimiento, que tiene una relacion con la tabla de cuenta y transaccion
CREATE TABLE BancoFuego.Movimiento(

    id_movimiento SERIAL PRIMARY KEY,
    tipo tipo_movimiento NOT NULL, -- Se usa el enun Tipo_movimiento para definir el tipo de movimiento
    monto NUMERIC(15,2) NOT NULL,
    saldo_anterior NUMERIC(15,2) NOT NULL,
    saldo_nuevo NUMERIC(15,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cuenta INTEGER NOT NULL,
    id_transaccion INTEGER NOT NULL,

    CONSTRAINT fk_movimiento_cuenta FOREIGN KEY(id_cuenta) REFERENCES BancoFuego.cuenta(id_cuenta)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_movimiento_transaccion FOREIGN KEY(id_transaccion) REFERENCES BancoFuego.transaccion(id_transaccion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);

-- Se crea la tabla de autenticacion, que tiene una relacion con la tabla de tarjeta
CREATE TABLE BancoFuego.Autenticacion(

    id_autenticacion SERIAL PRIMARY KEY,
    pin VARCHAR(255) NOT NULL,
    intentos INTEGER DEFAULT 0,
    bloqueado BOOLEAN DEFAULT FALSE,
    id_tarjeta INTEGER UNIQUE NOT NULL,

    CONSTRAINT chk_intentos
        CHECK(intentos >= 0),

    CONSTRAINT fk_tarjeta FOREIGN KEY(id_tarjeta) REFERENCES BancoFuego.tarjeta(id_tarjeta)
        ON UPDATE CASCADE
        ON DELETE CASCADE

);

-- Se crean los indices para optimizar las consultas en las tablas del esquema BancoFuego
CREATE INDEX idx_cliente_cedula
ON BancoFuego.Cliente(cedula);

CREATE INDEX idx_cuenta_numero
ON BancoFuego.Cuenta(numero_cuenta);

CREATE INDEX idx_tarjeta_numero
ON BancoFuego.Tarjeta(numero_tarjeta);

CREATE INDEX idx_movimiento_fecha
ON BancoFuego.Movimiento(fecha);

CREATE INDEX idx_transaccion_fecha
ON BancoFuego.Transaccion(fecha);