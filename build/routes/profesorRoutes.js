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
const ProfesoresController_1 = require("../controllers/ProfesoresController");
const router = express_1.default.Router();
/*router.get('/listarProfesores', async (req, res) => {
    const profesores = await consultarTodosProfes(req, res);
    res.render('listarProfesores', {
        pagina: 'Listar Profesores',
        profesores
});
});*/
//insertar
router.get('/listarProfesores', ProfesoresController_1.consultarTodosProfes);
router.get('/creaProfesores', (req, res) => {
    res.render('creaProfesores', {
        pagina: 'Crear Profesor',
    });
});
router.post('/', ProfesoresController_1.insertar);
//modificar
router.get('/modificaProfesor/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profesor = yield (0, ProfesoresController_1.consultarUno)(req, res);
    if (!profesor) {
        return res.status(404).send('Profesor no encontrado');
    }
    try {
        res.render('modificaProfesor', {
            profesor,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}));
router.put('/:id', ProfesoresController_1.modificar);
router.delete('/:id', ProfesoresController_1.eliminar);
exports.default = router;
