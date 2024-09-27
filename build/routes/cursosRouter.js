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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CursoController_1 = require("../controllers/CursoController");
const ProfesoresController_1 = require("../controllers/ProfesoresController");
const router = express_1.default.Router();
router.get('/listarCursos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cursos = yield (0, CursoController_1.obtenerlistadeCursos)();
    res.render('listarCursos', {
        pagina: 'Listar Cursos',
        cursos
    });
}));
//router.get('/listarCursos',consultarTodos);
//insertar 
router.get('/creaCursos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profesores = yield (0, ProfesoresController_1.consultarProfes)(req, res);
    res.render('creaCursos', {
        pagina: 'Crear Cursos',
        profesores
    });
}));
router.post('/', CursoController_1.insertar);
//modificar
router.get('/modificaCurso/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const curso = yield (0, CursoController_1.consultarUno)(req, res);
        const profesores = yield (0, ProfesoresController_1.consultarProfes)(req, res);
        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }
        res.render('modificaCurso', {
            curso,
            profesores
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}));
router.put('/:id', CursoController_1.modificar);
//eliminar
router.delete('/:id', CursoController_1.eliminar);
exports.default = router;
