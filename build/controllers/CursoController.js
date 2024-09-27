"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminar = exports.modificar = exports.insertar = exports.consultarUno = exports.obtenerlistadeCursos = exports.validar = void 0;
const express_validator_1 = require("express-validator");
const conexion_1 = require("../db/conexion");
const cursoModel_1 = require("../models/cursoModel");
const profesorModel_1 = require("../models/profesorModel");
var cursos;
const validar = () => [
    (0, express_validator_1.check)('dni')
        .notEmpty().withMessage('El DNI es obligatorio')
        .isLength({ min: 7 }).withMessage('El DNI debe tener al menos 7 caracteres'),
    (0, express_validator_1.check)('nombre').notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3 }).withMessage('El Nombre debe tener al menos 3 caracteres'),
    (0, express_validator_1.check)('apellido').notEmpty().withMessage('El apellido es obligatorio')
        .isLength({ min: 3 }).withMessage('El Apellido debe tener al menos 3 caracteres'),
    (0, express_validator_1.check)('email').isEmail().withMessage('Debe proporcionar un email válido'),
    (req, res, next) => {
        const errores = (0, express_validator_1.validationResult)(req);
        if (!errores.isEmpty()) {
            return res.render('creaEstudiantes', {
                pagina: 'Crear Estudiante',
                errores: errores.array()
            });
        }
        next();
    }
];
exports.validar = validar;
const obtenerlistadeCursos = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
        cursos = yield cursoRepository.find({ relations: ["profesor"] });
        return cursos; // Envolver el array en un objeto
    }
    catch (err) {
        if (err instanceof Error) {
            throw err;
        }
        else {
            throw new Error('Error desconocido');
        }
    }
});
exports.obtenerlistadeCursos = obtenerlistadeCursos;
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log(id);
    const idNumber = Number(id);
    if (isNaN(idNumber)) {
        throw new Error('ID inválido, debe ser un número');
    }
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
        const curso = yield cursoRepository.findOne({
            where: { id: idNumber },
            relations: ["profesor"]
        });
        if (curso) {
            return curso;
        }
        else {
            return null;
        }
    }
    catch (err) {
        if (err instanceof Error) {
            throw err;
        }
        else {
            throw new Error('Error desconocido');
        }
    }
});
exports.consultarUno = consultarUno;
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const errores = (0, express_validator_1.validationResult)(req);
    if (!errores.isEmpty()) {
        return res.render('creaCursos', {
            pagina: 'Crear Curso',
            errores: errores.array()
        });
    }
    const { nombre, descripcion, profesor_id } = req.body;
    try {
        console.log(req.body);
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const cursoRepository = yield transactionalEntityManager.getRepository(cursoModel_1.Curso);
            const profesorRepository = yield transactionalEntityManager.getRepository(profesorModel_1.Profesor);
            //verifico que exista el profesor que elijo para el curso
            const existeProfesor = yield profesorRepository.findOne({ where: { id: profesor_id } });
            console.log('Profesor encontrado:', existeProfesor);
            if (!existeProfesor) {
                throw new Error('El profesor no existe.');
            }
            //verifico que exista el curso que 
            const existeCurso = yield cursoRepository.findOne({
                where: [
                    { nombre },
                    { descripcion }
                ]
            });
            if (existeCurso) {
                throw new Error('El curso ya existe.');
            }
            const nuevoCurso = cursoRepository.create({ nombre, descripcion, profesor: existeProfesor }); // Aquí asigno el objeto Profesor
            console.log('Nuevo curso a insertar:', nuevoCurso);
            yield cursoRepository.save(nuevoCurso);
        }));
        // Redireccionar o mostrar mensaje de éxito
        res.redirect('/cursos/listarCursos'); // Redireccionar a la lista de cursos después de la inserción
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.insertar = insertar;
const modificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { nombre, descripcion, profesor_id } = req.body;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            // Verificar si el profesor existe
            const profesor = yield transactionalEntityManager.findOne(profesorModel_1.Profesor, { where: { id: profesor_id } });
            if (!profesor) {
                return res.status(400).json({ mensaje: 'El profesor no existe' });
            }
            // Verificar si el curso existe
            const curso = yield transactionalEntityManager.findOne(cursoModel_1.Curso, { where: { id: parseInt(id) } });
            if (!curso) {
                return res.status(404).json({ mensaje: 'El curso no existe' });
            }
            // Actualizar el curso utilizando merge
            transactionalEntityManager.merge(cursoModel_1.Curso, curso, {
                nombre,
                descripcion,
                profesor,
            });
            // Guardar los cambios
            const cursoActualizado = yield transactionalEntityManager.save(curso);
            res.redirect('/cursos/listarCursos');
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.modificar = modificar;
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        console.log(`ID recibido para eliminar el curso: ${id}`);
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const cursoRepository = transactionalEntityManager.getRepository(cursoModel_1.Curso);
            // Buscar el curso por ID
            const curso = yield cursoRepository.findOne({ where: { id: parseInt(id, 10) } });
            // Verificar si el curso existe
            if (!curso) {
                res.status(404).json({ mensaje: 'El curso no existe' });
                return;
            }
            // Eliminar el curso
            const deleteResult = yield cursoRepository.delete(id);
            if (deleteResult.affected === 1) {
                res.status(200).json({ mensaje: 'Curso eliminado' }); // Enviar respuesta con estado 200
            }
            else {
                res.status(400).json({ mensaje: 'Error al eliminar el curso' });
            }
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ mensaje: err.message });
        }
        else {
            res.status(500).json({ mensaje: 'Error desconocido' });
        }
    }
});
exports.eliminar = eliminar;
